import type { NextRequest } from "next/server";
import type { FilterQuery } from "mongoose";
import { connectDB } from "@/server/db";
import { Appointment, Salon, type IAppointment } from "@/server/models";
import {
  clientIp,
  handleApiError,
  ok,
  rateLimit,
  requireUser,
} from "@/server/api-helpers";
import { createBookingSchema } from "@/lib/validations/booking";
import { createBooking } from "@/server/services/booking.service";
import { toDateKey } from "@/lib/utils";

/** POST /api/bookings — customer creates a booking */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    rateLimit(`booking:${user.id}:${clientIp(req)}`, 10, 60 * 60 * 1000);

    const input = createBookingSchema.parse(await req.json());
    const appointment = await createBooking(
      { id: user.id, name: user.name, email: user.email },
      input
    );

    return ok(
      {
        id: appointment._id.toString(),
        bookingNumber: appointment.bookingNumber,
        status: appointment.status,
        date: appointment.date,
        startTime: appointment.startTime,
      },
      { message: "Booking request sent! The salon will confirm shortly." },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/** GET /api/bookings — role-aware listing (customer: mine, salon: theirs) */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    await connectDB();

    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const scope = sp.get("scope"); // "upcoming" | "past"
    const date = sp.get("date");
    const page = Math.max(1, Number(sp.get("page")) || 1);
    const limit = Math.min(50, Number(sp.get("limit")) || 20);

    const filter: FilterQuery<IAppointment> = {};

    if (user.role === "customer") {
      filter.customer = user.id;
    } else if (user.role === "owner" || user.role === "staff") {
      const salon =
        user.role === "owner"
          ? await Salon.findOne({ owner: user.id }).select("_id")
          : user.salonId
            ? await Salon.findById(user.salonId).select("_id")
            : null;
      if (!salon) return ok([], { pagination: { page: 1, limit, total: 0, totalPages: 0 } });
      filter.salon = salon._id;
    }
    // admin: no filter — sees everything

    if (status) filter.status = status;
    if (date) filter.date = date;
    if (scope === "upcoming") {
      filter.date = { $gte: toDateKey(new Date()) };
      filter.status = { $in: ["pending", "confirmed"] };
    } else if (scope === "past") {
      filter.$or = [
        { date: { $lt: toDateKey(new Date()) } },
        { status: { $in: ["completed", "cancelled", "no_show"] } },
      ];
    }

    const [bookings, total] = await Promise.all([
      Appointment.find(filter)
        .populate("salon", "name slug coverImage cityName address")
        .populate("staff", "name")
        .populate("customer", "name phone")
        .sort({ date: -1, startMinutes: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Appointment.countDocuments(filter),
    ]);

    return ok(bookings, {
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
