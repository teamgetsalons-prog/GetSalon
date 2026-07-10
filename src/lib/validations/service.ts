import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name is too short").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  categoryId: z.string().optional(),
  duration: z.coerce
    .number()
    .int()
    .min(10, "Minimum duration is 10 minutes")
    .max(480, "Maximum duration is 8 hours"),
  price: z.coerce.number().min(0, "Price cannot be negative").max(1000000),
  discountPrice: z.coerce.number().min(0).max(1000000).optional(),
  image: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const staffSchema = z.object({
  name: z.string().min(2).max(60),
  title: z.string().max(60).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
  serviceIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  workingHours: z
    .array(
      z.object({
        day: z.number().int().min(0).max(6),
        open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        isClosed: z.boolean().default(false),
      })
    )
    .max(7)
    .optional(),
});

export type StaffInput = z.infer<typeof staffSchema>;
