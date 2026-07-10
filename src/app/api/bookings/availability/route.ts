import type { NextRequest } from "next/server";
import { handleApiError, ok } from "@/server/api-helpers";
import { availabilityQuerySchema } from "@/lib/validations/booking";
import { getAvailability } from "@/server/services/booking.service";

/** GET /api/bookings/availability?salonId=&serviceId=&date=&staffId= */
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = availabilityQuerySchema.parse(params);
    const slots = await getAvailability(query);
    return ok(slots);
  } catch (err) {
    return handleApiError(err);
  }
}
