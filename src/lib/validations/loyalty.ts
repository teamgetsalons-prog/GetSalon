import { z } from "zod";

export const earnPointsSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  appointmentId: z.string().min(1, "Appointment ID is required"),
  amount: z.number().min(0, "Amount must be positive"),
});

export const redeemPointsSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  points: z.number().int().min(1, "Must redeem at least 1 point"),
  description: z.string().max(200).optional(),
});

export const loyaltyQuerySchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
});

export const loyaltyTransactionQuerySchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(["earn", "redeem", "expire", "adjust"]).optional(),
});
