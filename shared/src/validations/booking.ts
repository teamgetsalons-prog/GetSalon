import { z } from "zod";

export const createBookingSchema = z.object({
  salonId: z.string().cuid(),
  serviceId: z.string().cuid(),
  staffId: z.string().cuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const availabilityQuerySchema = z.object({
  salonId: z.string().cuid(),
  serviceId: z.string().cuid().optional(),
  staffId: z.string().cuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;

export const updateBookingSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional(),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
  staffId: z.string().cuid().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
