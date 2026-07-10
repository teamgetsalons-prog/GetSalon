import type { NextRequest } from "next/server";
import { handleApiError, ok, requireUser } from "@/server/api-helpers";
import { updateBookingSchema } from "@/lib/validations/booking";
import { updateBooking } from "@/server/services/booking.service";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/bookings/:id — confirm / complete / cancel / no_show / reschedule */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = updateBookingSchema.parse(await req.json());

    const appointment = await updateBooking(id, user, input);

    return ok(
      {
        id: appointment._id.toString(),
        status: appointment.status,
        date: appointment.date,
        startTime: appointment.startTime,
      },
      { message: "Booking updated." }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
