import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { Staff } from "@/server/models";
import {
  ApiError,
  handleApiError,
  ok,
  requireRole,
} from "@/server/api-helpers";
import { staffSchema } from "@/lib/validations/service";
import { getActorSalon } from "@/server/services/salon.service";

type Params = { params: Promise<{ id: string }> };

const leaveSchema = z.object({
  addLeave: z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      reason: z.string().max(200).optional(),
    })
    .optional(),
  removeLeaveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function loadOwnedStaff(id: string, user: Parameters<typeof getActorSalon>[0]) {
  const salon = await getActorSalon(user);
  if (!salon) throw new ApiError("Salon not found.", 404);

  await connectDB();
  const member = await Staff.findOne({ _id: id, salon: salon._id });
  if (!member) throw new ApiError("Staff member not found.", 404);
  return member;
}

/** PATCH /api/staff/:id — edit member, working hours, leaves */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole("owner", "staff", "admin");
    const { id } = await params;
    const member = await loadOwnedStaff(id, user);

    const body = await req.json();
    const input = staffSchema.partial().parse(body);
    const leave = leaveSchema.parse(body);

    if (input.name !== undefined) member.name = input.name;
    if (input.title !== undefined) member.title = input.title || undefined;
    if (input.bio !== undefined) member.bio = input.bio || undefined;
    if (input.avatar !== undefined) member.avatar = input.avatar || undefined;
    if (input.serviceIds !== undefined)
      member.set("services", input.serviceIds);
    if (input.workingHours !== undefined)
      member.set("workingHours", input.workingHours);
    if (input.isActive !== undefined) member.isActive = input.isActive;

    if (leave.addLeave) {
      if (!member.leaves.some((l) => l.date === leave.addLeave!.date)) {
        member.leaves.push(leave.addLeave);
      }
    }
    if (leave.removeLeaveDate) {
      member.set(
        "leaves",
        member.leaves.filter((l) => l.date !== leave.removeLeaveDate)
      );
    }

    await member.save();
    return ok(member.toJSON(), { message: "Staff member updated." });
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/staff/:id — deactivate member */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole("owner", "admin");
    const { id } = await params;
    const member = await loadOwnedStaff(id, user);

    member.isActive = false;
    await member.save();

    return ok({ id }, { message: "Staff member removed." });
  } catch (err) {
    return handleApiError(err);
  }
}
