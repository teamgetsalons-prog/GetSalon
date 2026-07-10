import { z } from "zod";
export const subscriptionUpgradeSchema = z.object({
    plan: z.enum(["basic", "premium"], {
        required_error: "Plan is required",
    }),
});
export const extendTrialSchema = z.object({
    salonId: z.string().min(1, "Salon ID is required"),
    additionalDays: z.coerce.number().int().min(1).max(365),
});
export const suspendSubscriptionSchema = z.object({
    salonId: z.string().min(1, "Salon ID is required"),
    reason: z.string().max(500).optional(),
});
export const subscriptionQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    plan: z.enum(["trial", "basic", "premium"]).optional(),
    status: z.enum(["active", "expired", "suspended"]).optional(),
    search: z.string().max(100).optional(),
});
