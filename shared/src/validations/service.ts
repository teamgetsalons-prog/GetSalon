import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  durationMinutes: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration must be at most 8 hours"),
  price: z.number().min(0, "Price must be at least 0"),
  currency: z.string().length(3).default("PKR"),
  category: z.string().max(100).optional(),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
  active: z.boolean().default(true),
  staffIds: z.array(z.string().cuid()).optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const staffSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  avatar: z.string().url("Invalid URL").optional().or(z.literal("")),
  title: z.string().max(100).optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  serviceIds: z.array(z.string().cuid()).optional(),
});

export type StaffInput = z.infer<typeof staffSchema>;
