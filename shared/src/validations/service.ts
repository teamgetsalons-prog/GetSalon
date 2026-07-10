import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  duration: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration must be at most 8 hours"),
  price: z.number().min(0, "Price must be at least 0"),
  currency: z.string().length(3).default("PKR"),
  categoryId: z.string().max(100).optional(),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  discountPrice: z.number().min(0).optional(),
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
  serviceIds: z.array(z.string()).optional(),
  workingHours: z
    .array(
      z.object({
        day: z.number().min(0).max(6),
        open: z.string(),
        close: z.string(),
        isClosed: z.boolean().default(false),
      })
    )
    .optional(),
  isActive: z.boolean().default(true),
});

export type StaffInput = z.infer<typeof staffSchema>;
