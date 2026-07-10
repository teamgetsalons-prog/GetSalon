import { z } from "zod";

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:mm");

export const openingHourSchema = z.object({
  day: z.number().int().min(0).max(6),
  open: timeString,
  close: timeString,
  isClosed: z.boolean().default(false),
});

export const createSalonSchema = z.object({
  name: z.string().min(3, "Salon name is too short").max(80),
  description: z.string().min(20, "Describe your salon in at least 20 characters").max(500),
  about: z.string().max(3000).optional(),
  categoryIds: z.array(z.string()).min(1, "Pick at least one category"),
  cityId: z.string().min(1, "City is required"),
  areaId: z.string().optional(),
  address: z.string().min(5, "Address is required").max(200),
  phone: z
    .string()
    .regex(/^(\+92|0)?[0-9]{9,11}$/, "Enter a valid phone number"),
  whatsapp: z
    .string()
    .regex(/^(\+92|0)?3[0-9]{9}$/, "Enter a valid WhatsApp number")
    .optional()
    .or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  genderServed: z.enum(["men", "women", "unisex"]),
  homeService: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  socials: z
    .object({
      facebook: z.string().url().optional().or(z.literal("")),
      instagram: z.string().url().optional().or(z.literal("")),
      tiktok: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

export type CreateSalonInput = z.infer<typeof createSalonSchema>;

export const updateSalonSchema = createSalonSchema.partial().extend({
  coverImage: z.string().url().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  openingHours: z.array(openingHourSchema).max(7).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(5).max(200),
        answer: z.string().min(5).max(1000),
      })
    )
    .max(20)
    .optional(),
  policies: z
    .object({
      cancellation: z.string().max(1000).optional(),
      notes: z.string().max(1000).optional(),
    })
    .optional(),
});

export type UpdateSalonInput = z.infer<typeof updateSalonSchema>;

export const searchSalonsSchema = z.object({
  q: z.string().max(100).optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  category: z.string().optional(),
  service: z.string().optional(),
  gender: z.enum(["men", "women", "unisex"]).optional(),
  homeService: z.coerce.boolean().optional(),
  openNow: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  sort: z
    .enum(["recommended", "rating", "reviews", "price_low", "price_high", "newest"])
    .default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type SearchSalonsInput = z.infer<typeof searchSalonsSchema>;
