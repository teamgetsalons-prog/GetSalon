import type { NextRequest } from "next/server";
import { z } from "zod";
import type { FilterQuery } from "mongoose";
import { connectDB } from "@/server/db";
import { AuditLog, User, type IUser } from "@/server/models";
import {
  ApiError,
  handleApiError,
  ok,
  requireRole,
} from "@/server/api-helpers";

/** GET /api/admin/users?role=&q=&page= — user management list */
export async function GET(req: NextRequest) {
  try {
    await requireRole("admin");
    await connectDB();

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page")) || 1);
    const limit = Math.min(50, Number(sp.get("limit")) || 20);
    const role = sp.get("role");
    const q = sp.get("q");

    const filter: FilterQuery<IUser> = {};
    if (role) filter.role = role;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email phone role isActive city createdAt lastLoginAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return ok(users, {
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

const updateSchema = z.object({
  userId: z.string().min(1),
  isActive: z.boolean(),
});

/** PATCH /api/admin/users — activate/deactivate an account */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole("admin");
    const { userId, isActive } = updateSchema.parse(await req.json());

    await connectDB();
    const target = await User.findById(userId);
    if (!target) throw new ApiError("User not found.", 404);
    if (target.role === "admin") {
      throw new ApiError("Admin accounts cannot be deactivated here.", 403);
    }

    target.isActive = isActive;
    await target.save();

    await AuditLog.create({
      actor: admin.id,
      actorRole: "admin",
      action: isActive ? "user.activate" : "user.deactivate",
      entity: "User",
      entityId: userId,
    });

    return ok(
      { id: userId, isActive },
      { message: isActive ? "Account activated." : "Account deactivated." }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
