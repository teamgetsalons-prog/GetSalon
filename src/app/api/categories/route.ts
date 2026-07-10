import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { Category } from "@/server/models";
import { handleApiError, ok, requireRole } from "@/server/api-helpers";
import { slugify } from "@/lib/utils";

/** GET /api/categories — public */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
      name: 1,
    });
    return ok(categories);
  } catch (err) {
    return handleApiError(err);
  }
}

const categorySchema = z.object({
  name: z.string().min(2).max(50),
  icon: z.string().max(40).optional(),
  image: z.string().url().optional(),
  description: z.string().max(300).optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().optional(),
});

/** POST /api/categories — admin */
export async function POST(req: NextRequest) {
  try {
    await requireRole("admin");
    const input = categorySchema.parse(await req.json());

    await connectDB();
    const category = await Category.create({
      ...input,
      slug: slugify(input.name),
    });

    return ok(category.toJSON(), { message: "Category created." }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
