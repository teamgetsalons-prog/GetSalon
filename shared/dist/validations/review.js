import { z } from "zod";
export const createReviewSchema = z.object({
    salonId: z.string().optional(),
    appointmentId: z.string(),
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    title: z.string().max(100, "Title must be at most 100 characters").optional(),
    comment: z
        .string()
        .min(10, "Comment must be at least 10 characters")
        .max(2000, "Comment must be at most 2000 characters"),
    photos: z.array(z.string()).optional(),
});
export const reviewActionSchema = z.object({
    reviewId: z.string().optional(),
    action: z.enum(["reply", "helpful", "report", "hide", "publish"]),
    reply: z.string().max(1000).optional(),
    reportReason: z.string().max(500).optional(),
});
