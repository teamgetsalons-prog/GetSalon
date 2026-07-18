import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  // Coerced: form inputs and query strings deliver numbers as strings.
  duration: z.coerce
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration must be at most 8 hours"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  currency: z.string().length(3).default("PKR"),
  categoryId: z.string().max(100).optional(),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  // null = explicitly clear an existing sale price; undefined = leave as-is
  // (PATCH omits untouched fields, and plain `undefined` never survives
  // JSON.stringify, so `null` is the only wire-safe way to signal "clear").
  // z.null() MUST come first: z.coerce.number() on `null` coerces to 0
  // instead of failing, so checking it first would swallow every `null`.
  discountPrice: z.union([z.null(), z.coerce.number().min(0)]).optional(),
  // Upper end of a price range (e.g. a haircut priced 1000-1500 depending on
  // hair length). Same null/undefined "clear vs leave as-is" semantics as
  // discountPrice above. Cross-field check (must exceed price) happens in
  // the route, since a partial PATCH may not always carry both fields.
  priceMax: z.union([z.null(), z.coerce.number().min(0)]).optional(),
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
