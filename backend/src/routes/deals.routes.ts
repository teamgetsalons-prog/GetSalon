import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Deal, Salon, Service } from "../models/index.js";
import { getActorSalon } from "../services/salon.service.js";

const router = Router();

// ── Validation schemas ─────────────────────────────────────

const createDealBaseSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(5).max(500),
  originalPrice: z.number().min(0),
  dealPrice: z.number().min(0),
  serviceId: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  terms: z.string().max(500).optional(),
  maxRedemptions: z.number().int().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const createDealSchema = createDealBaseSchema.refine((d) => d.dealPrice < d.originalPrice, {
  message: "Deal price must be less than original price",
  path: ["dealPrice"],
});

const updateDealSchema = createDealBaseSchema.partial();

// ── Public: list all active deals ──────────────────────────

router.get("/", async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const city = req.query.city as string | undefined;
  const salonId = req.query.salonId as string | undefined;
  const featured = req.query.featured === "true";

  const filter: Record<string, unknown> = { isActive: true };

  // Filter out expired deals
  const today = new Date().toISOString().slice(0, 10);
  filter.$or = [
    { endDate: { $exists: false } },
    { endDate: "" },
    { endDate: { $gte: today } },
  ];

  if (featured) filter.isFeatured = true;

  // Public listings must only ever show deals from live salons - without
  // this, deals from pending/suspended/deleted salons leak into /offers.
  if (salonId) {
    const live = await Salon.exists({ _id: salonId, status: "approved" });
    if (!live) {
      return ok(res, [], { pagination: { page: 1, limit, total: 0, totalPages: 0 } });
    }
    filter.salon = salonId;
  } else {
    const salonFilter: Record<string, unknown> = { status: "approved" };
    if (city) salonFilter.cityName = city;
    const salons = await Salon.find(salonFilter).select("_id");
    filter.salon = { $in: salons.map((s) => s._id) };
  }

  const [deals, total] = await Promise.all([
    Deal.find(filter)
      .populate("salon", "name slug coverImage cityName areaName rating isVerified isFeatured")
      .populate("service", "name duration price discountPrice")
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Deal.countDocuments(filter),
  ]);

  return ok(res, deals, {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ── Public: single deal by id ──────────────────────────────

router.get("/:id", async (req: Request, res: Response) => {
  const deal = await Deal.findById(req.params.id)
    .populate("salon", "name slug coverImage cityName areaName address phone rating isVerified")
    .populate("service", "name duration price discountPrice")
    .lean();
  if (!deal) return fail(res, "Deal not found.", 404);
  return ok(res, deal);
});

// ── Owner: list my salon's deals ───────────────────────────

router.get("/owner/mine", authenticate, requireRole("owner"), async (req: Request, res: Response) => {
  const salon = await getActorSalon(req.user!);
  if (!salon) return fail(res, "No salon found.", 404);

  const deals = await Deal.find({ salon: salon._id })
    .populate("service", "name price")
    .sort({ createdAt: -1 })
    .lean();

  return ok(res, deals);
});

// ── Owner: create deal ─────────────────────────────────────

router.post("/", authenticate, requireRole("owner"), async (req: Request, res: Response) => {
  const input = createDealSchema.parse(req.body);
  const salon = await getActorSalon(req.user!);
  if (!salon) return fail(res, "No salon found.", 404);

  let serviceName: string | undefined;
  if (input.serviceId) {
    const svc = await Service.findOne({ _id: input.serviceId, salon: salon._id });
    if (!svc) return fail(res, "Service not found.", 404);
    serviceName = svc.name;
  }

  const discountPercent = Math.round(
    ((input.originalPrice - input.dealPrice) / input.originalPrice) * 100
  );

  const deal = await Deal.create({
    salon: salon._id,
    title: input.title,
    description: input.description,
    originalPrice: input.originalPrice,
    dealPrice: input.dealPrice,
    discountPercent,
    service: input.serviceId || undefined,
    serviceName,
    image: input.image || undefined,
    terms: input.terms || undefined,
    maxRedemptions: input.maxRedemptions || undefined,
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
  });

  return ok(res, { id: deal._id.toString() }, undefined, 201);
});

// ── Owner: update deal ─────────────────────────────────────

router.patch("/:id", authenticate, requireRole("owner"), async (req: Request, res: Response) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return fail(res, "Deal not found.", 404);

  const salon = await getActorSalon(req.user!);
  if (!salon || deal.salon.toString() !== salon._id.toString()) {
    return fail(res, "Not allowed.", 403);
  }

  const input = updateDealSchema.parse(req.body);

  if (input.title !== undefined) deal.title = input.title;
  if (input.description !== undefined) deal.description = input.description;
  if (input.originalPrice !== undefined) deal.originalPrice = input.originalPrice;
  if (input.dealPrice !== undefined) deal.dealPrice = input.dealPrice;
  if (input.serviceId !== undefined) {
    if (input.serviceId) {
      const svc = await Service.findOne({ _id: input.serviceId, salon: salon._id });
      if (!svc) return fail(res, "Service not found.", 404);
      deal.service = svc._id;
      deal.serviceName = svc.name;
    } else {
      deal.service = undefined;
      deal.serviceName = undefined;
    }
  }
  if (input.image !== undefined) deal.image = input.image || undefined;
  if (input.terms !== undefined) deal.terms = input.terms || undefined;
  if (input.maxRedemptions !== undefined) deal.maxRedemptions = input.maxRedemptions || undefined;
  if (input.startDate !== undefined) deal.startDate = input.startDate || undefined;
  if (input.endDate !== undefined) deal.endDate = input.endDate || undefined;

  deal.discountPercent = Math.round(
    ((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100
  );

  await deal.save();
  return ok(res, { id: deal._id.toString() });
});

// ── Owner: toggle active/featured ──────────────────────────

router.patch("/:id/toggle", authenticate, requireRole("owner"), async (req: Request, res: Response) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return fail(res, "Deal not found.", 404);

  const salon = await getActorSalon(req.user!);
  if (!salon || deal.salon.toString() !== salon._id.toString()) {
    return fail(res, "Not allowed.", 403);
  }

  const { field } = req.body;
  if (field === "isActive") deal.isActive = !deal.isActive;
  else if (field === "isFeatured") deal.isFeatured = !deal.isFeatured;
  else return fail(res, "Invalid toggle field.", 400);

  await deal.save();
  return ok(res, { isActive: deal.isActive, isFeatured: deal.isFeatured });
});

// ── Owner: delete deal ─────────────────────────────────────

router.delete("/:id", authenticate, requireRole("owner"), async (req: Request, res: Response) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return fail(res, "Deal not found.", 404);

  const salon = await getActorSalon(req.user!);
  if (!salon || deal.salon.toString() !== salon._id.toString()) {
    return fail(res, "Not allowed.", 403);
  }

  await Deal.findByIdAndDelete(deal._id);
  return ok(res, { deleted: true });
});

// ── Admin: list all deals ──────────────────────────────────

router.get("/admin/all", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const deals = await Deal.find()
    .populate("salon", "name slug cityName")
    .populate("service", "name price")
    .sort({ createdAt: -1 })
    .lean();
  return ok(res, deals);
});

// ── Admin: toggle deal status ──────────────────────────────

router.patch("/:id/admin-toggle", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return fail(res, "Deal not found.", 404);

  const { field } = req.body;
  if (field === "isActive") deal.isActive = !deal.isActive;
  else if (field === "isFeatured") deal.isFeatured = !deal.isFeatured;
  else return fail(res, "Invalid toggle field.", 400);

  await deal.save();
  return ok(res, { isActive: deal.isActive, isFeatured: deal.isFeatured });
});

// ── Admin: delete deal ─────────────────────────────────────

router.delete("/:id/admin", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return fail(res, "Deal not found.", 404);
  await Deal.findByIdAndDelete(deal._id);
  return ok(res, { deleted: true });
});

export { router as dealRoutes };
