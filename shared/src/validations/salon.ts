import { z } from "zod";

export const openingHourSchema = z.object({
  day: z.number().min(0).max(6),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  isClosed: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.isClosed) return true;
    return data.open < data.close;
  },
  {
    message: "Opening time must be before closing time",
    path: ["close"],
  }
);

export type OpeningHourInput = z.infer<typeof openingHourSchema>;

export const createSalonSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
  about: z.string().max(3000).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z.string().min(5, "Address is required").max(300),
  cityId: z.string().min(1, "City is required"),
  areaId: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  genderServed: z.enum(["men", "women", "unisex"]).default("unisex"),
  homeService: z.boolean().default(false),
  whatsapp: z.string().optional(),
  socials: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
  coverImage: z.string().url("Invalid URL").optional().or(z.literal("")),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  categoryIds: z.array(z.string()).optional(),
  openingHours: z.array(openingHourSchema).optional(),
  galleryImages: z
    .array(
      z.object({
        url: z.string().url("Invalid URL"),
        alt: z.string().max(200),
        order: z.number().int().min(0),
      })
    )
    .optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(5).max(300),
        answer: z.string().min(10).max(2000),
      })
    )
    .optional(),
});

export type CreateSalonInput = z.infer<typeof createSalonSchema>;

export const updateSalonSchema = createSalonSchema.partial().extend({
  status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
  tagline: z.string().max(200).optional(),
  neighborhood: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  policies: z.object({
    cancellation: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

export type UpdateSalonInput = z.infer<typeof updateSalonSchema>;

export const searchSalonsSchema = z.object({
  q: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  area: z.string().max(100).optional(),
  category: z.string().optional(),
  service: z.string().optional(),
  gender: z.enum(["men", "women", "unisex"]).optional(),
  homeService: z.boolean().optional(),
  openNow: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sort: z
    .enum(["recommended", "rating", "reviews", "price_low", "price_high", "newest"])
    .optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
});

export type SearchSalonsInput = z.infer<typeof searchSalonsSchema>;
