import { z } from "zod";

export const earnPointsSchema = z.object({
  salonId: z.string().cuid(),
  customerId: z.string().cuid(),
  bookingId: z.string().cuid(),
  points: z.number().int().min(1, "Points must be at least 1").max(10000),
  description: z.string().max(200).optional(),
});

export type EarnPointsInput = z.infer<typeof earnPointsSchema>;

export const redeemPointsSchema = z.object({
  salonId: z.string().cuid(),
  customerId: z.string().cuid(),
  points: z.number().int().min(1, "Points must be at least 1"),
  bookingId: z.string().cuid().optional(),
  description: z.string().max(200).optional(),
}).refine(
  (data) => data.points > 0,
  { message: "Points to redeem must be greater than zero" }
);

export type RedeemPointsInput = z.infer<typeof redeemPointsSchema>;

export const loyaltyQuerySchema = z.object({
  salonId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  type: z.enum(["EARN", "REDEEM", "EXPIRE", "ADJUST"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type LoyaltyQueryInput = z.infer<typeof loyaltyQuerySchema>;

export const loyaltyAccountSchema = z.object({
  salonId: z.string().cuid(),
  customerId: z.string().cuid(),
});

export type LoyaltyAccountInput = z.infer<typeof loyaltyAccountSchema>;

export const adjustPointsSchema = z.object({
  salonId: z.string().cuid(),
  customerId: z.string().cuid(),
  points: z.number().int().min(-10000).max(10000).refine((p) => p !== 0, {
    message: "Points adjustment cannot be zero",
  }),
  description: z.string().min(5, "Description is required").max(500),
});

export type AdjustPointsInput = z.infer<typeof adjustPointsSchema>;

export const loyaltyTierSchema = z.object({
  salonId: z.string().cuid(),
  tiers: z
    .array(
      z.object({
        name: z.string().min(1).max(50),
        minPoints: z.number().int().min(0),
        benefits: z.array(z.string().max(200)),
      })
    )
    .min(1, "At least one tier is required")
    .max(10, "Maximum 10 tiers allowed"),
});

export type LoyaltyTierInput = z.infer<typeof loyaltyTierSchema>;
