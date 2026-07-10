import { z } from "zod";
export declare const subscriptionUpgradeSchema: z.ZodObject<{
    plan: z.ZodEnum<["basic", "premium"]>;
}, "strip", z.ZodTypeAny, {
    plan: "premium" | "basic";
}, {
    plan: "premium" | "basic";
}>;
export declare const extendTrialSchema: z.ZodObject<{
    salonId: z.ZodString;
    additionalDays: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    salonId: string;
    additionalDays: number;
}, {
    salonId: string;
    additionalDays: number;
}>;
export declare const suspendSubscriptionSchema: z.ZodObject<{
    salonId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    salonId: string;
    reason?: string | undefined;
}, {
    salonId: string;
    reason?: string | undefined;
}>;
export declare const subscriptionQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    plan: z.ZodOptional<z.ZodEnum<["trial", "basic", "premium"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "expired", "suspended"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "suspended" | "active" | "expired" | undefined;
    plan?: "premium" | "basic" | "trial" | undefined;
    search?: string | undefined;
}, {
    status?: "suspended" | "active" | "expired" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    plan?: "premium" | "basic" | "trial" | undefined;
    search?: string | undefined;
}>;
