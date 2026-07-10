import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { User } from "@/server/models";
import {
  ApiError,
  handleApiError,
  ok,
  requireUser,
} from "@/server/api-helpers";
import { updateProfileSchema } from "@/lib/validations/auth";

/** GET /api/users/me — current profile */
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const doc = await User.findById(user.id).select(
      "name email phone avatar city role createdAt"
    );
    if (!doc) throw new ApiError("User not found.", 404);

    return ok(doc.toJSON());
  } catch (err) {
    return handleApiError(err);
  }
}

/** PATCH /api/users/me — update profile */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const input = updateProfileSchema.parse(await req.json());

    await connectDB();
    const doc = await User.findById(user.id);
    if (!doc) throw new ApiError("User not found.", 404);

    if (input.name !== undefined) doc.name = input.name;
    if (input.phone !== undefined) doc.phone = input.phone || undefined;
    if (input.avatar !== undefined) doc.avatar = input.avatar || undefined;
    if (input.city !== undefined) doc.city = input.city || undefined;

    await doc.save();
    return ok(
      { name: doc.name, phone: doc.phone, avatar: doc.avatar, city: doc.city },
      { message: "Profile updated." }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
