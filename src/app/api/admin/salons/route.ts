import type { NextRequest } from "next/server";
import type { FilterQuery } from "mongoose";
import { connectDB } from "@/server/db";
import { Salon, type ISalon } from "@/server/models";
import { handleApiError, ok, requireRole } from "@/server/api-helpers";

/** GET /api/admin/salons?status=&q=&page= — moderation list */
export async function GET(req: NextRequest) {
  try {
    await requireRole("admin");
    await connectDB();

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page")) || 1);
    const limit = Math.min(50, Number(sp.get("limit")) || 20);
    const status = sp.get("status");
    const q = sp.get("q");

    const filter: FilterQuery<ISalon> = {};
    if (status) filter.status = status;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { cityName: rx }, { phone: rx }];
    }

    const [salons, total] = await Promise.all([
      Salon.find(filter)
        .populate("owner", "name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Salon.countDocuments(filter),
    ]);

    return ok(salons, {
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
