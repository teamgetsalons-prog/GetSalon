import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Appointment, User } from "../models/index.js";
import { createBookingSchema, updateBookingSchema, availabilityQuerySchema } from "../../../shared/dist/validations/booking.js";
import { createBooking, updateBooking, getAvailability } from "../services/booking.service.js";
import { toDateKey } from "../../../shared/dist/utils.js";
import { getActorSalon } from "../services/salon.service.js";

const router = Router();

router.post("/", authenticate, async (req: Request, res: Response) => {
  const input = createBookingSchema.parse(req.body);
  const user = await User.findById(req.user!.id).select("name email");
  const appointment = await createBooking(
    { id: req.user!.id, name: user?.name, email: user?.email, salonId: req.user!.salonId },
    input
  );

  return ok(res, {
    id: appointment._id.toString(),
    bookingNumber: appointment.bookingNumber,
    status: appointment.status,
    date: appointment.date,
    startTime: appointment.startTime,
  }, undefined, 201);
});

router.get("/", authenticate, async (req: Request, res: Response) => {
  const user = req.user!;
  const status = req.query.status as string | undefined;
  const scope = req.query.scope as string | undefined;
  const date = req.query.date as string | undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);

  const filter: Record<string, unknown> = {};

  if (user.role === "customer") {
    filter.customer = user.id;
  } else if (user.role === "owner" || user.role === "staff") {
    const salon = await getActorSalon(user);
    if (!salon) return ok(res, [], { pagination: { page: 1, limit, total: 0, totalPages: 0 } });
    filter.salon = salon._id;
  }

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

  return ok(res, bookings, {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

router.get("/availability", async (req: Request, res: Response) => {
  const params = Object.fromEntries(Object.entries(req.query).map(([k, v]) => [k, String(v)]));
  const query = availabilityQuerySchema.parse(params);
  const slots = await getAvailability(query);
  return ok(res, slots);
});

router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updateBookingSchema.parse(req.body);

  const appointment = await updateBooking(id as string, req.user! as any, input);
  return ok(res, {
    id: appointment._id.toString(),
    status: appointment.status,
    date: appointment.date,
    startTime: appointment.startTime,
  });
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const appointment = await Appointment.findById(id);
  if (!appointment) return fail(res, "Booking not found.", 404);

  if (user.role === "customer" && appointment.customer.toString() !== user.id) {
    return fail(res, "Not allowed.", 403);
  }

  if (user.role === "owner" || user.role === "staff") {
    const salon = await getActorSalon(user);
    if (!salon || appointment.salon.toString() !== salon._id.toString()) {
      return fail(res, "Not allowed.", 403);
    }
  }

  appointment.status = "cancelled";
  await appointment.save();

  return ok(res, { id: appointment._id.toString(), status: "cancelled" });
});

export { router as bookingRoutes };
export default router;
