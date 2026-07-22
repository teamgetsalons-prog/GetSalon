import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, optionalAuth, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Salon, Service } from "../models/index.js";
import { serviceSchema } from "../../../shared/dist/validations/service.js";
import { getActorSalon, recalcPriceRange } from "../services/salon.service.js";

const router = Router();

// optionalAuth (not authenticate): the list stays public for booking pages,
// but a logged-in owner/admin with ?all=1 also gets hidden services - the
// role check below always ran, it just never saw req.user without this.
router.get("/", optionalAuth, async (req: Request, res: Response) => {
  const salonId = req.query.salonId as string;
  if (!salonId) return fail(res, "salonId is required.");

  let includeInactive = false;
  if (req.query.all) {
    if (req.user) {
      const salon = await getActorSalon(req.user);
      includeInactive = req.user.role === "admin" || salon?._id.toString() === salonId;
    }
  }

  const services = await Service.find({
    salon: salonId,
    ...(includeInactive ? {} : { isActive: true }),
  })
    .populate("category", "name")
    .sort({ isPopular: -1, price: 1 });

  return ok(res, services);
});

router.post("/", authenticate, requireRole("owner", "staff", "admin"), async (req: Request, res: Response) => {
  // Admins manage services across every salon, so they name the target
  // explicitly; owners/staff always operate on their own salon as before.
  const salon =
    req.user!.role === "admin" && req.body.salonId
      ? await Salon.findById(String(req.body.salonId))
      : await getActorSalon(req.user!);
  if (!salon) return fail(res, "Create your salon profile first.", 404);

  const input = serviceSchema.parse(req.body);
  const priceMax = input.priceMax || undefined;
  if (priceMax !== undefined && priceMax <= input.price) {
    return fail(res, "The upper price must be higher than the starting price.", 422);
  }

  const service = await Service.create({
    salon: salon._id,
    name: input.name,
    description: input.description || undefined,
    category: input.categoryId || undefined,
    duration: input.duration,
    price: input.price,
    discountPrice: input.discountPrice || undefined,
    priceMax,
    image: input.image || undefined,
    isActive: input.isActive,
    isPopular: input.isPopular,
  });

  await recalcPriceRange(salon._id.toString());
  return ok(res, service.toJSON(), undefined, 201);
});

router.patch("/:id", authenticate, requireRole("owner", "staff", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;

  // Admin edits any salon's service by id; owner/staff stay scoped to
  // their own salon exactly as before.
  let service;
  if (req.user!.role === "admin") {
    service = await Service.findById(id);
  } else {
    const salon = await getActorSalon(req.user!);
    if (!salon) return fail(res, "Salon not found.", 404);
    service = await Service.findOne({ _id: id, salon: salon._id });
  }
  if (!service) return fail(res, "Service not found.", 404);

  const input = serviceSchema.partial().parse(req.body);

  // Validate the resulting price/priceMax pair, not just whichever of the
  // two happens to be in this particular request.
  const finalPrice = input.price ?? service.price;
  const finalPriceMax =
    input.priceMax === undefined
      ? service.priceMax
      : input.priceMax === null
        ? undefined
        : input.priceMax;
  if (finalPriceMax !== undefined && finalPriceMax <= finalPrice) {
    return fail(res, "The upper price must be higher than the starting price.", 422);
  }

  if (input.name !== undefined) service.name = input.name;
  if (input.description !== undefined) service.description = input.description || undefined;
  if (input.categoryId !== undefined) service.set("category", input.categoryId || undefined);
  if (input.duration !== undefined) service.duration = input.duration;
  if (input.price !== undefined) service.price = input.price;
  if (input.discountPrice !== undefined) {
    service.discountPrice = input.discountPrice === null ? undefined : input.discountPrice;
  }
  if (input.priceMax !== undefined) {
    service.priceMax = input.priceMax === null ? undefined : input.priceMax;
  }
  if (input.image !== undefined) service.image = input.image || undefined;
  if (input.isActive !== undefined) service.isActive = input.isActive;
  if (input.isPopular !== undefined) service.isPopular = input.isPopular;

  await service.save();
  await recalcPriceRange(service.salon.toString());

  return ok(res, service.toJSON());
});

router.delete("/:id", authenticate, requireRole("owner", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;

  let service;
  if (req.user!.role === "admin") {
    service = await Service.findById(id);
  } else {
    const salon = await getActorSalon(req.user!);
    if (!salon) return fail(res, "Salon not found.", 404);
    service = await Service.findOne({ _id: id, salon: salon._id });
  }
  if (!service) return fail(res, "Service not found.", 404);

  service.isActive = false;
  await service.save();
  await recalcPriceRange(service.salon.toString());

  return ok(res, { id });
});

export { router as serviceRoutes };
export default router;
