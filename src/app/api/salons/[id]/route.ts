import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { Salon } from "@/server/models";
import {
  ApiError,
  handleApiError,
  ok,
  requireUser,
} from "@/server/api-helpers";
import { updateSalonSchema } from "@/lib/validations/salon";
import { updateSalon } from "@/server/services/salon.service";

type Params = { params: Promise<{ id: string }> };

/** GET /api/salons/:id — full document (owner/admin only; public uses slug pages) */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireUser();

    await connectDB();
    const salon = await Salon.findById(id)
      .populate("categories", "name slug")
      .populate("city", "name slug")
      .populate("area", "name slug");

    if (!salon) throw new ApiError("Salon not found.", 404);

    const isOwner = salon.owner.toString() === user.id;
    if (!isOwner && user.role !== "admin" && user.salonId !== id) {
      throw new ApiError("Not allowed.", 403);
    }

    return ok(salon.toJSON());
  } catch (err) {
    return handleApiError(err);
  }
}

/** PATCH /api/salons/:id — owner/admin edits salon profile */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const input = updateSalonSchema.parse(await req.json());

    const salon = await updateSalon(id, user, input);
    return ok(
      { id: salon._id.toString(), slug: salon.slug },
      { message: "Salon updated." }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
