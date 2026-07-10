import { z } from "zod";
export declare const createReviewSchema: z.ZodObject<{
    salonId: z.ZodString;
    appointmentId: z.ZodString;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    comment: z.ZodString;
    photos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    salonId: string;
    appointmentId: string;
    comment: string;
    title?: string | undefined;
    photos?: string[] | undefined;
}, {
    rating: number;
    salonId: string;
    appointmentId: string;
    comment: string;
    title?: string | undefined;
    photos?: string[] | undefined;
}>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export declare const reviewActionSchema: z.ZodObject<{
    reviewId: z.ZodString;
    action: z.ZodEnum<["reply", "helpful", "report", "hide", "publish"]>;
    reply: z.ZodOptional<z.ZodString>;
    reportReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "reply" | "helpful" | "report" | "hide" | "publish";
    reviewId: string;
    reply?: string | undefined;
    reportReason?: string | undefined;
}, {
    action: "reply" | "helpful" | "report" | "hide" | "publish";
    reviewId: string;
    reply?: string | undefined;
    reportReason?: string | undefined;
}>;
export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
