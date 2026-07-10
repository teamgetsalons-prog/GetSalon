import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { Service } from "@/server/models";
import {
  ApiError,
  fail,
  handleApiError,
  ok,
  requireRole,
} from "@/server/api-helpers";
import { serviceSchema } from "@/lib/validations/service";
import {
  getActorSalon,
  recalcPriceRange,
} from "@/server/services/salon.service";

/** GET /api/services?salonId= — public list of a salon's active services.
 *  With ?all=1, the salon's owner/staff (or admin) also sees inactive ones. */
export async function GET(req: NextRequest) {
  try {
    const salonId = req.nextUrl.searchParams.get("salonId");
    if (!salonId) return fail("salonId is required.");

    await connectDB();

    let includeInactive = false;
    if (req.nextUrl.searchParams.get("all")) {
      const { auth } = await import("@/server/auth");
      const session = await auth();
      const user = session?.user;
      if (user) {
        const salon = await getActorSalon(user);
        includeInactive =
          user.role === "admin" || salon?._id.toString() === salonId;
      }
    }

    const services = await Service.find({
      salon: salonId,
      ...(includeInactive ? {} : { isActive: true }),
    })
      .populate("category", "name")
      .sort({ isPopular: -1, price: 1 });

    return ok(services);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/services — owner adds a service to their salon */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("owner", "staff", "admin");
    const salon = await getActorSalon(user);
    if (!salon) throw new ApiError("Create your salon profile first.", 404);

    const input = serviceSchema.parse(await req.json());

    const service = await Service.create({
      salon: salon._id,
      name: input.name,
      description: input.description || undefined,
      category: input.categoryId || undefined,
      duration: input.duration,
      price: input.price,
      discountPrice: input.discountPrice || undefined,
      image: input.image || undefined,
      isActive: input.isActive,
      isPopular: input.isPopular,
    });

    await recalcPriceRange(salon._id.toString());

    return ok(service.toJSON(), { message: "Service added." }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
