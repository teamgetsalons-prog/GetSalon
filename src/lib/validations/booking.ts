import { z } from "zod";

const dateKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:mm");

export const createBookingSchema = z.object({
  salonId: z.string().min(1, "Salon is required"),
  serviceId: z.string().min(1, "Please select a service"),
  staffId: z.string().optional(),
  date: dateKey,
  startTime: timeString,
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const availabilityQuerySchema = z.object({
  salonId: z.string().min(1),
  serviceId: z.string().min(1),
  staffId: z.string().optional(),
  date: dateKey,
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

export const updateBookingSchema = z.object({
  action: z.enum(["confirm", "complete", "cancel", "no_show", "reschedule"]),
  cancelReason: z.string().max(300).optional(),
  date: dateKey.optional(),
  startTime: timeString.optional(),
  staffId: z.string().optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
