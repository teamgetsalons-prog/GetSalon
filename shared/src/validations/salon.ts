import { z } from "zod";

export const openingHourSchema = z.object({
  day: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  closed: z.boolean(),
}).refine(
  (data) => {
    if (data.closed) return true;
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
  tagline: z.string().max(200, "Tagline must be at most 200 characters").optional(),
  description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z.string().min(5, "Address is required").max(300),
  city: z.string().min(2, "City is required").max(100),
  neighborhood: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  genderServed: z.enum(["MALE", "FEMALE", "UNISEX"]).default("UNISEX"),
  coverImage: z.string().url("Invalid URL").optional().or(z.literal("")),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
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
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type UpdateSalonInput = z.infer<typeof updateSalonSchema>;

export const searchSalonsSchema = z.object({
  q: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  genderServed: z.enum(["MALE", "FEMALE", "UNISEX"]).optional(),
  minRating: z.number().min(0).max(5).optional(),
  serviceId: z.string().cuid().optional(),
  sort: z
    .enum(["rating_desc", "rating_asc", "reviews_desc", "distance_asc", "name_asc"])
    .optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
});

export type SearchSalonsInput = z.infer<typeof searchSalonsSchema>;
