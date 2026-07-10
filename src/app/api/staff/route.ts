import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { Staff } from "@/server/models";
import {
  ApiError,
  fail,
  handleApiError,
  ok,
  requireRole,
} from "@/server/api-helpers";
import { staffSchema } from "@/lib/validations/service";
import { getActorSalon } from "@/server/services/salon.service";

/** GET /api/staff?salonId= — public list of a salon's active staff */
export async function GET(req: NextRequest) {
  try {
    const salonId = req.nextUrl.searchParams.get("salonId");
    if (!salonId) return fail("salonId is required.");

    await connectDB();
    const staff = await Staff.find({ salon: salonId, isActive: true })
      .populate("services", "name")
      .sort({ "rating.average": -1 });

    return ok(staff);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/staff — owner adds a team member */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("owner", "admin");
    const salon = await getActorSalon(user);
    if (!salon) throw new ApiError("Create your salon profile first.", 404);

    const input = staffSchema.parse(await req.json());

    const member = await Staff.create({
      salon: salon._id,
      name: input.name,
      title: input.title || undefined,
      bio: input.bio || undefined,
      avatar: input.avatar || undefined,
      services: input.serviceIds,
      workingHours: input.workingHours ?? [],
      isActive: input.isActive,
    });

    return ok(member.toJSON(), { message: "Team member added." }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
