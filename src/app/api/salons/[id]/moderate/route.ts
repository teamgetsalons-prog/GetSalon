import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError, ok, requireRole } from "@/server/api-helpers";
import { moderateSalon } from "@/server/services/salon.service";

const moderateSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "feature", "unfeature"]),
  reason: z.string().max(500).optional(),
});

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/salons/:id/moderate — admin approval workflow */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireRole("admin");
    const { id } = await params;
    const { action, reason } = moderateSchema.parse(await req.json());

    const salon = await moderateSalon(id, admin, action, reason);
    return ok(
      { id: salon._id.toString(), status: salon.status, isFeatured: salon.isFeatured },
      { message: `Salon ${action}d.` }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
