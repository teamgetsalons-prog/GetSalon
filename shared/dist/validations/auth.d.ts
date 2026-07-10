import { z } from "zod";
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<["customer", "owner", "staff"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "customer" | "owner" | "staff";
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string | undefined;
    role?: "customer" | "owner" | "staff" | undefined;
}>, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "customer" | "owner" | "staff";
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string | undefined;
    role?: "customer" | "owner" | "staff" | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const updateProfileSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    avatar: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    city: z.ZodOptional<z.ZodString>;
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    city?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    city?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}>, {
    name?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    city?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    city?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
