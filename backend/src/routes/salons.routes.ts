import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, optionalAuth, requireRole, signToken, authCookieOptions } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Salon } from "../models/index.js";
import { createSalonSchema, searchSalonsSchema, updateSalonSchema } from "../../../shared/dist/validations/salon.js";
import { createSalon, getHomePageData, getSalonPageData, searchSalons, updateSalon, moderateSalon, listOwnedSalons, switchActiveSalon } from "../services/salon.service.js";
import { deleteImage } from "../services/upload.service.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const params = Object.fromEntries(Object.entries(req.query).map(([k, v]) => [k, String(v)]));
  const input = searchSalonsSchema.parse(params);
  const result = await searchSalons(input);

  return ok(res, result.salons, {
    pagination: {
      page: result.page,
      limit: input.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

router.get("/homepage", async (_req: Request, res: Response) => {
  const data = await getHomePageData();
  return ok(res, data);
});

router.get("/public/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const data = await getSalonPageData(slug);
  if (!data) return fail(res, "Salon not found.", 404);
  return ok(res, data);
});

router.post("/", authenticate, async (req: Request, res: Response) => {
  const input = createSalonSchema.parse(req.body);
  const user = req.user!;
  const salon = await createSalon(user.id, input);

  // The salon dashboard and middleware resolve the owner's salon from the
  // JWT's salonId, so re-issue the session immediately - otherwise the
  // owner would have to log out and back in to see their new salon.
  const token = signToken({
    id: user.id,
    role: "owner",
    salonId: salon._id.toString(),
  });
  res.cookie("getsalons_token", token, authCookieOptions);

  return ok(res, { id: salon._id.toString(), slug: salon.slug, status: salon.status }, undefined, 201);
});

// Must come before GET /:id - otherwise "mine" is captured as an :id param.
router.get("/mine", authenticate, requireRole("owner"), async (req: Request, res: Response) => {
  const salons = await listOwnedSalons(req.user!.id);
  return ok(
    res,
    salons.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      slug: s.slug,
      status: s.status,
      cityName: s.cityName,
      areaName: s.areaName,
      address: s.address,
      isFeatured: s.isFeatured,
      createdAt: s.createdAt,
    }))
  );
});

router.post("/:id/switch", authenticate, requireRole("owner"), async (req: Request, res: Response) => {
  const salon = await switchActiveSalon(req.user!.id, req.params.id as string);

  // Re-issue the session so every getActorSalon-based route and the
  // dashboard's own salonId lookups resolve to the newly active branch.
  const token = signToken({
    id: req.user!.id,
    role: "owner",
    salonId: salon._id.toString(),
  });
  res.cookie("getsalons_token", token, authCookieOptions);

  return ok(res, { id: salon._id.toString(), slug: salon.slug, status: salon.status });
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const salon = await Salon.findById(id)
    .populate("categories", "name slug")
    .populate("city", "name slug")
    .populate("area", "name slug");

  if (!salon) return fail(res, "Salon not found.", 404);

  const isOwner = salon.owner.toString() === user.id;
  if (!isOwner && user.role !== "admin" && user.salonId !== id) {
    return fail(res, "Not allowed.", 403);
  }

  return ok(res, salon.toJSON());
});

router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updateSalonSchema.parse(req.body);

  const salon = await updateSalon(id as string, req.user!, input);
  return ok(res, { id: salon._id.toString(), slug: salon.slug });
});

router.post("/:id/gallery", authenticate, requireRole("owner", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const salon = await Salon.findById(id);
  if (!salon) return fail(res, "Salon not found.", 404);
  if (user.role !== "admin" && salon.owner.toString() !== user.id) {
    return fail(res, "Not allowed.", 403);
  }

  const { url, publicId, caption } = req.body;
  (salon.gallery as any).push({ url, publicId, caption });
  await salon.save();

  return ok(res, salon.gallery, undefined, 201);
});

router.delete("/:id/gallery/:imageId", authenticate, requireRole("owner", "admin"), async (req: Request, res: Response) => {
  const { id, imageId } = req.params;
  const user = req.user!;

  const salon = await Salon.findById(id);
  if (!salon) return fail(res, "Salon not found.", 404);
  if (user.role !== "admin" && salon.owner.toString() !== user.id) {
    return fail(res, "Not allowed.", 403);
  }

  const images = salon.gallery as any[];
  const image = images.find((g) => g._id?.toString() === imageId);
  if (!image) return fail(res, "Image not found.", 404);

  if (image.publicId) await deleteImage(image.publicId);

  salon.gallery = images.filter((g) => g._id?.toString() !== imageId) as any;
  await salon.save();

  return ok(res, salon.gallery);
});

router.post("/:id/moderate", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, reason } = req.body;

  const salon = await moderateSalon(id as string, req.user! as any, action as "approve" | "reject" | "suspend" | "feature" | "unfeature", reason as string | undefined);
  return ok(res, { id: salon._id.toString(), status: salon.status, isFeatured: salon.isFeatured });
});

export { router as salonRoutes };
export default router;
