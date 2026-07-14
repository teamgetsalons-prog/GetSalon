import { z } from "zod";
export const registerSchema = z
    .object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be at most 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    confirmPassword: z.string(),
    phone: z
        .string()
        .regex(/^(\+?[1-9]\d{6,14}|0\d{9,10})$/, "Invalid phone number")
        .optional(),
    role: z.enum(["customer", "owner", "staff"]).default("customer"),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be at most 100 characters")
        .optional(),
    phone: z
        .string()
        .regex(/^(\+?[1-9]\d{6,14}|0\d{9,10})$/, "Invalid phone number")
        .optional()
        .or(z.literal("")),
    avatar: z.string().url("Invalid URL").optional().or(z.literal("")),
    city: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
        .optional(),
}).refine((data) => {
    if (data.newPassword && !data.currentPassword)
        return false;
    return true;
}, {
    message: "Current password is required when setting a new password",
    path: ["currentPassword"],
});
export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});
export const resetPasswordSchema = z
    .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
