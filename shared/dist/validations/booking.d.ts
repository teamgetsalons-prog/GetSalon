import { z } from "zod";
export declare const createBookingSchema: z.ZodObject<{
    salonId: z.ZodString;
    serviceId: z.ZodString;
    staffId: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    startTime: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    contactName: z.ZodString;
    contactPhone: z.ZodString;
    contactEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    date: string;
    salonId: string;
    serviceId: string;
    startTime: string;
    contactName: string;
    contactPhone: string;
    staffId?: string | undefined;
    notes?: string | undefined;
    contactEmail?: string | undefined;
}, {
    date: string;
    salonId: string;
    serviceId: string;
    startTime: string;
    contactName: string;
    contactPhone: string;
    staffId?: string | undefined;
    notes?: string | undefined;
    contactEmail?: string | undefined;
}>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export declare const availabilityQuerySchema: z.ZodObject<{
    salonId: z.ZodString;
    serviceId: z.ZodOptional<z.ZodString>;
    staffId: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    salonId: string;
    serviceId?: string | undefined;
    staffId?: string | undefined;
}, {
    date: string;
    salonId: string;
    serviceId?: string | undefined;
    staffId?: string | undefined;
}>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
export declare const updateBookingSchema: z.ZodObject<{
    action: z.ZodEnum<["confirm", "complete", "cancel", "no_show", "reschedule"]>;
    cancelReason: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    staffId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "no_show" | "confirm" | "complete" | "cancel" | "reschedule";
    date?: string | undefined;
    staffId?: string | undefined;
    startTime?: string | undefined;
    cancelReason?: string | undefined;
}, {
    action: "no_show" | "confirm" | "complete" | "cancel" | "reschedule";
    date?: string | undefined;
    staffId?: string | undefined;
    startTime?: string | undefined;
    cancelReason?: string | undefined;
}>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
