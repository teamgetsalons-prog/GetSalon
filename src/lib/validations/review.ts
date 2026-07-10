import { z } from "zod";

export const createReviewSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  rating: z.coerce.number().int().min(1, "Please give a rating").max(5),
  title: z.string().max(100).optional().or(z.literal("")),
  comment: z
    .string()
    .min(10, "Please write at least 10 characters")
    .max(2000),
  photos: z.array(z.string().url()).max(5).default([]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reviewActionSchema = z.object({
  action: z.enum(["reply", "helpful", "report", "hide", "publish"]),
  reply: z.string().min(2).max(1000).optional(),
  reportReason: z.string().max(300).optional(),
});

export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
