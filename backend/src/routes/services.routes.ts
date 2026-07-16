import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, optionalAuth, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Service } from "../models/index.js";
import { serviceSchema } from "../../../shared/dist/validations/service.js";
import { getActorSalon, recalcPriceRange } from "../services/salon.service.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
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
  const salon = await getActorSalon(req.user!);
  if (!salon) return fail(res, "Create your salon profile first.", 404);

  const input = serviceSchema.parse(req.body);

  const service = await Service.create({
    salon: salon._id,
    name: input.name,
    description: input.description || undefined,
    category: input.categoryId || undefined,
    duration: input.duration,
    price: input.price,
    discountPrice: input.discountPrice || undefined,
    image: input.image || undefined,
    isActive: input.isActive,
    isPopular: input.isPopular,
  });

  await recalcPriceRange(salon._id.toString());
  return ok(res, service.toJSON(), undefined, 201);
});

router.patch("/:id", authenticate, requireRole("owner", "staff", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const salon = await getActorSalon(req.user!);
  if (!salon) return fail(res, "Salon not found.", 404);

  const service = await Service.findOne({ _id: id, salon: salon._id });
  if (!service) return fail(res, "Service not found.", 404);

  const input = serviceSchema.partial().parse(req.body);

  if (input.name !== undefined) service.name = input.name;
  if (input.description !== undefined) service.description = input.description || undefined;
  if (input.categoryId !== undefined) service.set("category", input.categoryId || undefined);
  if (input.duration !== undefined) service.duration = input.duration;
  if (input.price !== undefined) service.price = input.price;
  if (input.discountPrice !== undefined) {
    service.discountPrice = input.discountPrice === null ? undefined : input.discountPrice;
  }
  if (input.image !== undefined) service.image = input.image || undefined;
  if (input.isActive !== undefined) service.isActive = input.isActive;
  if (input.isPopular !== undefined) service.isPopular = input.isPopular;

  await service.save();
  await recalcPriceRange(salon._id.toString());

  return ok(res, service.toJSON());
});

router.delete("/:id", authenticate, requireRole("owner", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const salon = await getActorSalon(req.user!);
  if (!salon) return fail(res, "Salon not found.", 404);

  const service = await Service.findOne({ _id: id, salon: salon._id });
  if (!service) return fail(res, "Service not found.", 404);

  service.isActive = false;
  await service.save();
  await recalcPriceRange(salon._id.toString());

  return ok(res, { id });
});

export { router as serviceRoutes };
export default router;
