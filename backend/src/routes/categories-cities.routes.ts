import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Category, City, Area } from "../models/index.js";
import { slugify } from "../../../shared/src/utils.js";

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
  const cities = await City.find({ isActive: true }).sort({ order: 1 });

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

export { router as categoryCityRoutes };
export default router;
