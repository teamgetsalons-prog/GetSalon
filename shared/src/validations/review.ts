import { z } from "zod";

export const createReviewSchema = z.object({
  salonId: z.string().cuid(),
  bookingId: z.string().cuid().optional(),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().max(100, "Title must be at most 100 characters").optional(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(2000, "Comment must be at most 2000 characters"),
  staffRating: z.number().int().min(1).max(5).optional(),
  serviceRating: z.number().int().min(1).max(5).optional(),
  ambianceRating: z.number().int().min(1).max(5).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reviewActionSchema = z.object({
  reviewId: z.string().cuid(),
  action: z.enum(["APPROVE", "REJECT", "FLAG", "RESPOND"]),
  response: z.string().max(1000, "Response must be at most 1000 characters").optional(),
});

export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
