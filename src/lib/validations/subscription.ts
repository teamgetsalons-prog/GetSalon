import { z } from "zod";

export const subscriptionUpgradeSchema = z.object({
  plan: z.enum(["basic", "premium"], {
    required_error: "Plan is required",
    invalid_type_error: "Plan must be 'basic' or 'premium'",
  }),
  paymentMethod: z
    .enum(["easypaisa", "jazzcash", "payfast", "stripe"], {
      required_error: "Payment method is required",
    })
    .default("easypaisa"),
});

export const directUpgradeSchema = z.object({
  plan: z.enum(["basic", "premium"]),
});

export const extendTrialSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  additionalDays: z.coerce
    .number()
    .int()
    .min(1, "Must extend by at least 1 day")
    .max(365, "Cannot extend by more than 365 days"),
});

export const suspendSubscriptionSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  reason: z.string().max(500).optional(),
});

export const subscriptionAdminActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("extend"),
    salonId: z.string(),
    additionalDays: z.number().int().min(1).max(365),
  }),
  z.object({
    action: z.literal("suspend"),
    salonId: z.string(),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal("upgrade"),
    salonId: z.string(),
    plan: z.enum(["basic", "premium"]),
  }),
]);

export const paymentWebhookSchema = z.object({
  transactionId: z.string(),
  invoiceNumber: z.string(),
  status: z.string(),
  amount: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const subscriptionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  plan: z.enum(["trial", "basic", "premium"]).optional(),
  status: z.enum(["active", "expired", "suspended"]).optional(),
  search: z.string().max(100).optional(),
});
