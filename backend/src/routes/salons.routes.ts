import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, optionalAuth, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Salon } from "../models/index.js";
import { createSalonSchema, searchSalonsSchema, updateSalonSchema } from "../../../shared/src/validations/salon.js";
import { createSalon, searchSalons, updateSalon, moderateSalon } from "../services/salon.service.js";
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

router.post("/", authenticate, async (req: Request, res: Response) => {
  const input = createSalonSchema.parse(req.body);
  const salon = await createSalon(req.user!.id, input);

  return ok(res, { id: salon._id.toString(), slug: salon.slug, status: salon.status }, undefined, 201);
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

  const salon = await updateSalon(id, req.user!, input);
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
  salon.gallery.push({ url, publicId, caption });
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

  const image = salon.gallery.find((g: { _id?: string }) => g._id?.toString() === imageId);
  if (!image) return fail(res, "Image not found.", 404);

  if (image.publicId) await deleteImage(image.publicId);

  salon.gallery = salon.gallery.filter((g: { _id?: string }) => g._id?.toString() !== imageId);
  await salon.save();

  return ok(res, salon.gallery);
});

router.post("/:id/moderate", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, reason } = req.body;

  const salon = await moderateSalon(id, req.user!, action, reason);
  return ok(res, { id: salon._id.toString(), status: salon.status, isFeatured: salon.isFeatured });
});

export { router as salonRoutes };
export default router;
