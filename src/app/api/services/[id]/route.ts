import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { Service } from "@/server/models";
import {
  ApiError,
  handleApiError,
  ok,
  requireRole,
} from "@/server/api-helpers";
import { serviceSchema } from "@/lib/validations/service";
import {
  getActorSalon,
  recalcPriceRange,
} from "@/server/services/salon.service";

type Params = { params: Promise<{ id: string }> };

async function loadOwnedService(id: string, user: Parameters<typeof getActorSalon>[0]) {
  const salon = await getActorSalon(user);
  if (!salon) throw new ApiError("Salon not found.", 404);

  await connectDB();
  const service = await Service.findOne({ _id: id, salon: salon._id });
  if (!service) throw new ApiError("Service not found.", 404);
  return { salon, service };
}

/** PATCH /api/services/:id — edit a service */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole("owner", "staff", "admin");
    const { id } = await params;
    const { salon, service } = await loadOwnedService(id, user);

    const input = serviceSchema.partial().parse(await req.json());

    if (input.name !== undefined) service.name = input.name;
    if (input.description !== undefined)
      service.description = input.description || undefined;
    if (input.categoryId !== undefined)
      service.set("category", input.categoryId || undefined);
    if (input.duration !== undefined) service.duration = input.duration;
    if (input.price !== undefined) service.price = input.price;
    if (input.discountPrice !== undefined)
      service.discountPrice = input.discountPrice || undefined;
    if (input.image !== undefined) service.image = input.image || undefined;
    if (input.isActive !== undefined) service.isActive = input.isActive;
    if (input.isPopular !== undefined) service.isPopular = input.isPopular;

    await service.save();
    await recalcPriceRange(salon._id.toString());

    return ok(service.toJSON(), { message: "Service updated." });
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/services/:id — soft delete (deactivate) */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole("owner", "admin");
    const { id } = await params;
    const { salon, service } = await loadOwnedService(id, user);

    service.isActive = false;
    await service.save();
    await recalcPriceRange(salon._id.toString());

    return ok({ id }, { message: "Service removed." });
  } catch (err) {
    return handleApiError(err);
  }
}
