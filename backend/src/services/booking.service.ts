import type { FilterQuery, Types } from "mongoose";
import { connectDB } from "../db.js";
import {
  Appointment,
  Salon,
  Service,
  Staff,
  User,
  type IAppointment,
  type ISalon,
  type IService,
  type IStaff,
} from "../models/index.js";
import { ApiError } from "../middleware/error-handler.js";
import {
  MAX_BOOKING_DAYS_AHEAD,
  MIN_BOOKING_LEAD_MINUTES,
  SLOT_INTERVAL,
} from "../../../shared/dist/constants.js";
import {
  formatDateKey,
  formatTime12h,
  fromDateKey,
  generateBookingNumber,
  minutesToTime,
  timeToMinutes,
  toDateKey,
} from "../../../shared/dist/utils.js";
import type { OpeningHour, TimeSlot, UserRole } from "../../../shared/dist/types.js";
import type {
  AvailabilityQueryInput as AvailabilityQuery,
  CreateBookingInput,
  UpdateBookingInput,
} from "../../../shared/dist/validations/booking.js";
import { bookingEmailHtml } from "./email.js";
import { notify } from "./notification.service.js";
import { isActiveSubscription } from "./subscription.service.js";

interface Actor {
  id: string;
  role: UserRole;
  salonId?: string;
}

function getDayWindow(
  hours: OpeningHour[],
  day: number
): { open: number; close: number } | null {
  const entry = hours.find((h) => h.day === day);
  if (!entry || entry.isClosed) return null;
  const open = timeToMinutes(entry.open);
  const close = timeToMinutes(entry.close);
  return close > open ? { open, close } : null;
}

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** Staff who can perform a service (empty services list = performs all) */
function staffOffersService(staff: IStaff, serviceId: string): boolean {
  if (!staff.services || staff.services.length === 0) return true;
  return staff.services.some((s) => s.toString() === serviceId);
}

async function loadBookableContext(salonId: string, serviceId: string) {
  await connectDB();
  const salon = await Salon.findById(salonId);
  if (!salon || salon.status !== "approved") {
    throw new ApiError("Salon not found or not accepting bookings.", 404);
  }
  const service = await Service.findOne({
    _id: serviceId,
    salon: salon._id,
    isActive: true,
  });
  if (!service) {
    throw new ApiError("This service is no longer available.", 404);
  }
  return { salon, service };
}

function assertDateInRange(dateKey: string, startMinutes?: number): void {
  const target = fromDateKey(dateKey).getTime();
  const today = fromDateKey(toDateKey(new Date())).getTime();
  const diffDays = Math.round((target - today) / 86_400_000);

  if (diffDays < 0) {
    throw new ApiError("You cannot book a date in the past.");
  }
  if (diffDays > MAX_BOOKING_DAYS_AHEAD) {
    throw new ApiError(
      `Bookings can only be made up to ${MAX_BOOKING_DAYS_AHEAD} days ahead.`
    );
  }
  if (
    diffDays === 0 &&
    startMinutes !== undefined &&
    startMinutes < nowMinutes() + MIN_BOOKING_LEAD_MINUTES
  ) {
    throw new ApiError(
      `Bookings need at least ${MIN_BOOKING_LEAD_MINUTES} minutes notice.`
    );
  }
}

/**
 * Compute open time slots for a service on a date.
 * When staffId is omitted, a slot is open if ANY qualified staff member is
 * free — the first free member is attached to the slot.
 */
export async function getAvailability(
  q: AvailabilityQuery
): Promise<TimeSlot[]> {
  const { salon, service } = await loadBookableContext(q.salonId, q.serviceId ?? "");
  assertDateInRange(q.date);

  const day = fromDateKey(q.date).getDay();
  const duration = service.duration;

  const staffFilter: FilterQuery<IStaff> = {
    salon: salon._id,
    isActive: true,
  };
  if (q.staffId) staffFilter._id = q.staffId;

  const staffList = (await Staff.find(staffFilter)).filter((s) =>
    staffOffersService(s, q.serviceId ?? "")
  );
  if (q.staffId && staffList.length === 0) {
    throw new ApiError("This specialist does not offer the selected service.");
  }

  const appointments = await Appointment.find({
    salon: salon._id,
    date: q.date,
    status: { $in: ["pending", "confirmed"] },
  }).select("staff startMinutes endMinutes");

  const isToday = q.date === toDateKey(new Date());
  const minStart = isToday ? nowMinutes() + MIN_BOOKING_LEAD_MINUTES : 0;

  const slots = new Map<number, TimeSlot>();

  const collectSlots = (
    window: { open: number; close: number },
    busy: { startMinutes: number; endMinutes: number }[],
    staff?: IStaff
  ) => {
    // Align the first slot to the interval grid
    const first = Math.ceil(window.open / SLOT_INTERVAL) * SLOT_INTERVAL;
    for (let start = first; start + duration <= window.close; start += SLOT_INTERVAL) {
      if (start < minStart || slots.has(start)) continue;
      const end = start + duration;
      const clash = busy.some(
        (b) => b.startMinutes < end && b.endMinutes > start
      );
      if (!clash) {
        slots.set(start, {
          time: minutesToTime(start),
          minutes: start,
          available: true,
          staffId: staff?._id.toString(),
          staffName: staff?.name,
        });
      }
    }
  };

  if (staffList.length > 0) {
    for (const staff of staffList) {
      if (staff.leaves?.some((l) => l.date === q.date)) continue;
      const hours = staff.workingHours?.length
        ? staff.workingHours
        : salon.openingHours;
      const window = getDayWindow(hours, day);
      if (!window) continue;
      const sid = staff._id.toString();
      const busy = appointments.filter((a) => a.staff?.toString() === sid);
      collectSlots(window, busy, staff);
    }
  } else {
    // Salon without staff records: single-chair capacity from salon hours
    const window = getDayWindow(salon.openingHours, day);
    if (window) {
      const busy = appointments.filter((a) => !a.staff);
      collectSlots(window, busy);
    }
  }

  return [...slots.values()].sort((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0));
}

/** Find a staff member free for the given range (respects preference) */
async function resolveStaff(
  salon: ISalon,
  service: IService,
  dateKey: string,
  startMinutes: number,
  endMinutes: number,
  preferredStaffId?: string
): Promise<IStaff | null> {
  const day = fromDateKey(dateKey).getDay();

  const filter: FilterQuery<IStaff> = { salon: salon._id, isActive: true };
  if (preferredStaffId) filter._id = preferredStaffId;

  const candidates = (await Staff.find(filter)).filter((s) =>
    staffOffersService(s, service._id.toString())
  );

  if (preferredStaffId && candidates.length === 0) {
    throw new ApiError("Selected specialist does not offer this service.");
  }
  if (candidates.length === 0) return null;

  const busyAppts = await Appointment.find({
    salon: salon._id,
    date: dateKey,
    status: { $in: ["pending", "confirmed"] },
    staff: { $in: candidates.map((c) => c._id) },
    startMinutes: { $lt: endMinutes },
    endMinutes: { $gt: startMinutes },
  }).select("staff");

  const busyIds = new Set(busyAppts.map((a) => a.staff?.toString()));

  for (const staff of candidates) {
    if (busyIds.has(staff._id.toString())) continue;
    if (staff.leaves?.some((l) => l.date === dateKey)) continue;
    const hours = staff.workingHours?.length
      ? staff.workingHours
      : salon.openingHours;
    const window = getDayWindow(hours, day);
    if (!window || startMinutes < window.open || endMinutes > window.close) {
      continue;
    }
    return staff;
  }

  throw new ApiError(
    "That time slot was just booked. Please pick another slot.",
    409
  );
}

export async function createBooking(
  customer: { id: string; name?: string | null; email?: string | null; salonId?: string },
  input: CreateBookingInput
): Promise<IAppointment> {
  const { salon, service } = await loadBookableContext(
    input.salonId,
    input.serviceId
  );

  // Owners and their staff cannot book appointments at their own salon -
  // it would pollute their schedule/analytics and inflate booking counts.
  if (salon.owner.toString() === customer.id || customer.salonId === salon._id.toString()) {
    throw new ApiError("You cannot book an appointment at your own salon.", 403);
  }

  // ── Subscription enforcement ──
  const hasActiveSubscription = await isActiveSubscription(input.salonId);
  if (!hasActiveSubscription) {
    throw new ApiError(
      "This salon's subscription has expired. Please ask the salon owner to renew their plan.",
      403
    );
  }

  const startMinutes = timeToMinutes(input.startTime);
  const endMinutes = startMinutes + service.duration;
  assertDateInRange(input.date, startMinutes);

  const staff = await resolveStaff(
    salon,
    service,
    input.date,
    startMinutes,
    endMinutes,
    input.staffId
  );

  // No staff records at all → single-chair salon capacity check
  if (!staff) {
    const day = fromDateKey(input.date).getDay();
    const window = getDayWindow(salon.openingHours, day);
    if (!window || startMinutes < window.open || endMinutes > window.close) {
      throw new ApiError("The salon is closed at that time.");
    }
    const clash = await Appointment.exists({
      salon: salon._id,
      date: input.date,
      status: { $in: ["pending", "confirmed"] },
      staff: { $exists: false },
      startMinutes: { $lt: endMinutes },
      endMinutes: { $gt: startMinutes },
    });
    if (clash) {
      throw new ApiError(
        "That time slot was just booked. Please pick another slot.",
        409
      );
    }
  }

  const price =
    service.discountPrice && service.discountPrice < service.price
      ? service.discountPrice
      : service.price;

  let appointment: IAppointment;
  try {
    appointment = await Appointment.create({
      bookingNumber: generateBookingNumber(),
      customer: customer.id,
      salon: salon._id,
      service: service._id,
      staff: staff?._id,
      serviceSnapshot: {
        name: service.name,
        price,
        duration: service.duration,
      },
      date: input.date,
      startTime: input.startTime,
      startMinutes,
      endMinutes,
      price,
      status: "pending",
      contact: {
        name: input.contactName,
        phone: input.contactPhone,
        email: input.contactEmail || undefined,
      },
      notes: input.notes || undefined,
    });
  } catch (err) {
    // Unique index backstop — two requests raced for the same slot
    if ((err as { code?: number })?.code === 11000) {
      throw new ApiError(
        "That time slot was just booked. Please pick another slot.",
        409
      );
    }
    throw err;
  }

  Service.updateOne({ _id: service._id }, { $inc: { bookingCount: 1 } }).catch(
    () => undefined
  );

  // Fan out notifications (never blocks the booking)
  const prettyDate = input.date;
  const prettyTime = formatTime12h(input.startTime);

  await notify({
    userId: customer.id,
    type: "booking_created",
    title: "Booking request sent!",
    message: `${service.name} at ${salon.name} on ${prettyDate}, ${prettyTime}.`,
    link: `/dashboard/bookings`,
    email: customer.email
      ? {
          to: customer.email,
          subject: `Booking ${appointment.bookingNumber} — ${salon.name}`,
          html: bookingEmailHtml({
            bookingNumber: appointment.bookingNumber,
            salonName: salon.name,
            serviceName: service.name,
            staffName: staff?.name,
            date: prettyDate,
            time: prettyTime,
            price,
            address: salon.address,
          }),
        }
      : undefined,
  });

  const owner = await User.findById(salon.owner).select("email");
  if (owner) {
    await notify({
      userId: owner._id.toString(),
      type: "booking_created",
      title: "New booking request",
      message: `${customer.name ?? "A customer"} requested ${service.name} on ${prettyDate}, ${prettyTime}.`,
      link: `/salon-dashboard/bookings`,
      email: owner.email
        ? {
            to: owner.email,
            subject: `New booking ${appointment.bookingNumber}`,
            html: bookingEmailHtml({
              bookingNumber: appointment.bookingNumber,
              salonName: salon.name,
              serviceName: service.name,
              staffName: staff?.name,
              date: prettyDate,
              time: prettyTime,
              price,
            }),
          }
        : undefined,
    });
  }

  return appointment;
}

const SALON_SIDE_ACTIONS = new Set(["confirm", "complete", "no_show"]);

export async function updateBooking(
  bookingId: string,
  actor: Actor,
  input: UpdateBookingInput
): Promise<IAppointment> {
  await connectDB();

  const appointment = await Appointment.findById(bookingId);
  if (!appointment) throw new ApiError("Booking not found.", 404);

  const isAdmin = actor.role === "admin";
  const isCustomer = appointment.customer.toString() === actor.id;
  const isSalonSide =
    (actor.role === "owner" || actor.role === "staff") &&
    actor.salonId === appointment.salon.toString();

  if (!isAdmin && !isCustomer && !isSalonSide) {
    throw new ApiError("You don't have permission to modify this booking.", 403);
  }

  const { action } = input;

  if (SALON_SIDE_ACTIONS.has(action) && !isSalonSide && !isAdmin) {
    throw new ApiError("Only the salon can perform this action.", 403);
  }

  const finished = ["completed", "cancelled", "no_show"];
  if (finished.includes(appointment.status)) {
    throw new ApiError("This booking is already closed.");
  }

  switch (action) {
    case "confirm":
      appointment.status = "confirmed";
      break;

    case "complete":
      appointment.status = "completed";
      if (appointment.staff) {
        Staff.updateOne(
          { _id: appointment.staff },
          { $inc: { completedBookings: 1 } }
        ).catch(() => undefined);
      }
      break;

    case "no_show":
      appointment.status = "no_show";
      break;

    case "cancel":
      appointment.status = "cancelled";
      appointment.cancelledBy = isAdmin
        ? "admin"
        : isSalonSide
          ? "salon"
          : "customer";
      appointment.cancelReason = input.cancelReason;
      break;

    case "reschedule": {
      if (!input.date || !input.startTime) {
        throw new ApiError("New date and time are required to reschedule.");
      }
      const { salon, service } = await loadBookableContext(
        appointment.salon.toString(),
        appointment.service.toString()
      );
      const startMinutes = timeToMinutes(input.startTime);
      const endMinutes = startMinutes + appointment.serviceSnapshot.duration;
      assertDateInRange(input.date, startMinutes);

      const staff = await resolveStaff(
        salon,
        service,
        input.date,
        startMinutes,
        endMinutes,
        input.staffId ?? appointment.staff?.toString()
      );

      appointment.date = input.date;
      appointment.startTime = input.startTime;
      appointment.startMinutes = startMinutes;
      appointment.endMinutes = endMinutes;
      appointment.staff = (staff?._id ?? undefined) as Types.ObjectId | undefined;
      // Customer reschedules go back to pending for salon re-approval
      if (isCustomer && !isSalonSide) appointment.status = "pending";
      break;
    }
  }

  await appointment.save();

  // Notify the other side about the change
  const statusTitles: Record<string, string> = {
    confirm: "Booking confirmed ✔",
    complete: "Thanks for visiting!",
    cancel: "Booking cancelled",
    no_show: "Booking marked as no-show",
    reschedule: "Booking rescheduled",
  };

  const notifyUserId =
    isCustomer && action !== "cancel"
      ? appointment.customer.toString()
      : appointment.customer.toString();

  const customerDoc = await User.findById(notifyUserId).select("email");
  await notify({
    userId: notifyUserId,
    type:
      action === "confirm"
        ? "booking_confirmed"
        : action === "cancel"
          ? "booking_cancelled"
          : action === "reschedule"
            ? "booking_rescheduled"
            : "system",
    title: statusTitles[action] ?? "Booking updated",
    message: `Booking ${appointment.bookingNumber}: ${appointment.serviceSnapshot.name} on ${appointment.date}, ${formatTime12h(appointment.startTime)}.`,
    link: "/dashboard/bookings",
    email:
      customerDoc?.email && (action === "confirm" || action === "cancel")
        ? {
            to: customerDoc.email,
            subject: `${statusTitles[action]} — ${appointment.bookingNumber}`,
            html: `<p>Booking <b>${appointment.bookingNumber}</b> (${appointment.serviceSnapshot.name}) on ${appointment.date} at ${formatTime12h(appointment.startTime)} has been updated to: <b>${appointment.status.replace("_", " ")}</b>.</p>`,
          }
        : undefined,
  });

  return appointment;
}
