import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Category, City, Area, Salon } from "../models/index.js";
import { slugify } from "../../../shared/dist/utils.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
  return ok(res, categories);
});

const categorySchema = z.object({
  name: z.string().min(2).max(50),
  icon: z.string().max(40).optional(),
  image: z.string().url().optional(),
  description: z.string().max(300).optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().optional(),
});

router.post("/", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const input = categorySchema.parse(req.body);

  const category = await Category.create({
    ...input,
    slug: slugify(input.name),
  });

  return ok(res, category.toJSON(), undefined, 201);
});

router.get("/cities", async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.onlyWithSalons) {
    filter.salonCount = { $gt: 0 };
  }
  const cities = await City.find(filter).sort({ order: 1 });

  if (req.query.withAreas) {
    const areas = await Area.find({ isActive: true }).sort({ name: 1 });
    const grouped = cities.map((c) => ({
      ...c.toJSON(),
      areas: areas.filter((a) => a.city.toString() === c._id.toString()),
    }));
    return ok(res, grouped);
  }

  return ok(res, cities);
});

const citySchema = z.object({
  name: z.string().min(2).max(50),
  province: z.string().min(2).max(50),
  areas: z.array(z.string().min(2).max(60)).optional(),
});

router.post("/cities", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const input = citySchema.parse(req.body);

  const city = await City.create({
    name: input.name,
    slug: slugify(input.name),
    province: input.province,
  });

  if (input.areas?.length) {
    await Area.insertMany(
      input.areas.map((name) => ({
        name,
        slug: slugify(name),
        city: city._id,
      }))
    );
  }

  return ok(res, city.toJSON(), undefined, 201);
});

// NOTE: /cities/:id routes must be registered before the generic /:id
// category routes, or "cities" would be captured as a category id.

router.patch("/cities/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const input = citySchema.partial().parse(req.body);
  const city = await City.findById(req.params.id);
  if (!city) return fail(res, "City not found.", 404);

  if (input.name !== undefined) {
    city.name = input.name;
    city.slug = slugify(input.name);
    // Salons denormalize the city name for display and search.
    await Salon.updateMany({ city: city._id }, { cityName: input.name });
  }
  if (input.province !== undefined) city.province = input.province;
  await city.save();

  // Replacing the area list: keep areas whose names are still present,
  // add new ones, remove the rest.
  if (input.areas !== undefined) {
    const wanted = new Set(input.areas.map((a) => a.trim()).filter(Boolean));
    const existing = await Area.find({ city: city._id });
    const existingNames = new Set(existing.map((a) => a.name));
    const toRemove = existing.filter((a) => !wanted.has(a.name)).map((a) => a._id);
    if (toRemove.length) await Area.deleteMany({ _id: { $in: toRemove } });
    const toAdd = [...wanted].filter((name) => !existingNames.has(name));
    if (toAdd.length) {
      await Area.insertMany(toAdd.map((name) => ({ name, slug: slugify(name), city: city._id })));
    }
  }

  return ok(res, city.toJSON());
});

router.delete("/cities/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const city = await City.findById(req.params.id);
  if (!city) return fail(res, "City not found.", 404);

  const salonCount = await Salon.countDocuments({ city: city._id });
  if (salonCount > 0) {
    return fail(res, `Cannot delete: ${salonCount} salon(s) are registered in ${city.name}. Move or remove them first.`, 409);
  }

  await Area.deleteMany({ city: city._id });
  await City.deleteOne({ _id: city._id });
  return ok(res, { deleted: true });
});

router.patch("/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const input = categorySchema.partial().parse(req.body);
  const category = await Category.findById(req.params.id);
  if (!category) return fail(res, "Category not found.", 404);

  if (input.name !== undefined) {
    category.name = input.name;
    category.slug = slugify(input.name);
  }
  if (input.icon !== undefined) category.icon = input.icon;
  if (input.image !== undefined) category.image = input.image;
  if (input.description !== undefined) category.description = input.description;
  if (input.isFeatured !== undefined) category.isFeatured = input.isFeatured;
  if (input.order !== undefined) category.order = input.order;
  await category.save();

  return ok(res, category.toJSON());
});

router.delete("/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) return fail(res, "Category not found.", 404);

  // Salons referencing this category just lose the tag.
  await Salon.updateMany({ categories: category._id }, { $pull: { categories: category._id } });
  await Category.deleteOne({ _id: category._id });
  return ok(res, { deleted: true });
});

export { router as categoryCityRoutes };
export default router;
