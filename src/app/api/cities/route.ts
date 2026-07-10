import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { Area, City } from "@/server/models";
import { handleApiError, ok, requireRole } from "@/server/api-helpers";
import { slugify } from "@/lib/utils";

/** GET /api/cities?withAreas=1 — public */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const cities = await City.find({ isActive: true }).sort({ order: 1 });

    if (req.nextUrl.searchParams.get("withAreas")) {
      const areas = await Area.find({ isActive: true }).sort({ name: 1 });
      const grouped = cities.map((c) => ({
        ...c.toJSON(),
        areas: areas.filter((a) => a.city.toString() === c._id.toString()),
      }));
      return ok(grouped);
    }

    return ok(cities);
  } catch (err) {
    return handleApiError(err);
  }
}

const citySchema = z.object({
  name: z.string().min(2).max(50),
  province: z.string().min(2).max(50),
  areas: z.array(z.string().min(2).max(60)).optional(),
});

/** POST /api/cities — admin adds a city (optionally with areas) */
export async function POST(req: NextRequest) {
  try {
    await requireRole("admin");
    const input = citySchema.parse(await req.json());

    await connectDB();
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

    return ok(city.toJSON(), { message: "City added." }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
