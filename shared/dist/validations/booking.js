import { z } from "zod";
export const createBookingSchema = z.object({
    salonId: z.string(),
    serviceId: z.string(),
    staffId: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
    // Contact info the salon uses to reach the customer about THIS visit.
    contactName: z.string().min(2, "Please enter your name").max(100),
    contactPhone: z
        .string()
        .regex(/^(\+?[1-9]\d{6,14}|0\d{9,10})$/, "Please enter a valid phone number"),
    contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});
export const availabilityQuerySchema = z.object({
    salonId: z.string(),
    serviceId: z.string().optional(),
    staffId: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});
export const updateBookingSchema = z.object({
    action: z.enum(["confirm", "complete", "cancel", "no_show", "reschedule"]),
    cancelReason: z.string().max(500).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional(),
    staffId: z.string().optional(),
});
