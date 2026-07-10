import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),
  email: z.string().email("Enter a valid email address").toLowerCase(),
  phone: z
    .string()
    .regex(
      /^(\+92|0)?3[0-9]{9}$/,
      "Enter a valid Pakistani mobile number (03XXXXXXXXX)"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  role: z.enum(["customer", "owner"]).default("customer"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  phone: z
    .string()
    .regex(/^(\+92|0)?3[0-9]{9}$/, "Enter a valid Pakistani mobile number")
    .optional()
    .or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
  city: z.string().max(60).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
