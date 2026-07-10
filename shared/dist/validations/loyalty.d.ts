import { z } from "zod";
export declare const earnPointsSchema: z.ZodObject<{
    salonId: z.ZodString;
    customerId: z.ZodString;
    bookingId: z.ZodString;
    points: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    salonId: string;
    customerId: string;
    bookingId: string;
    points: number;
    description?: string | undefined;
}, {
    salonId: string;
    customerId: string;
    bookingId: string;
    points: number;
    description?: string | undefined;
}>;
export type EarnPointsInput = z.infer<typeof earnPointsSchema>;
export declare const redeemPointsSchema: z.ZodEffects<z.ZodObject<{
    salonId: z.ZodString;
    customerId: z.ZodString;
    points: z.ZodNumber;
    bookingId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    salonId: string;
    customerId: string;
    points: number;
    description?: string | undefined;
    bookingId?: string | undefined;
}, {
    salonId: string;
    customerId: string;
    points: number;
    description?: string | undefined;
    bookingId?: string | undefined;
}>, {
    salonId: string;
    customerId: string;
    points: number;
    description?: string | undefined;
    bookingId?: string | undefined;
}, {
    salonId: string;
    customerId: string;
    points: number;
    description?: string | undefined;
    bookingId?: string | undefined;
}>;
export type RedeemPointsInput = z.infer<typeof redeemPointsSchema>;
export declare const loyaltyQuerySchema: z.ZodObject<{
    salonId: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["EARN", "REDEEM", "EXPIRE", "ADJUST"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    type?: "EARN" | "REDEEM" | "EXPIRE" | "ADJUST" | undefined;
    salonId?: string | undefined;
    customerId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    type?: "EARN" | "REDEEM" | "EXPIRE" | "ADJUST" | undefined;
    salonId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    customerId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export type LoyaltyQueryInput = z.infer<typeof loyaltyQuerySchema>;
export declare const loyaltyAccountSchema: z.ZodObject<{
    salonId: z.ZodString;
    customerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    salonId: string;
    customerId: string;
}, {
    salonId: string;
    customerId: string;
}>;
export type LoyaltyAccountInput = z.infer<typeof loyaltyAccountSchema>;
export declare const adjustPointsSchema: z.ZodObject<{
    salonId: z.ZodString;
    customerId: z.ZodString;
    points: z.ZodEffects<z.ZodNumber, number, number>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    salonId: string;
    description: string;
    customerId: string;
    points: number;
}, {
    salonId: string;
    description: string;
    customerId: string;
    points: number;
}>;
export type AdjustPointsInput = z.infer<typeof adjustPointsSchema>;
export declare const loyaltyTierSchema: z.ZodObject<{
    salonId: z.ZodString;
    tiers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        minPoints: z.ZodNumber;
        benefits: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        minPoints: number;
        benefits: string[];
    }, {
        name: string;
        minPoints: number;
        benefits: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    salonId: string;
    tiers: {
        name: string;
        minPoints: number;
        benefits: string[];
    }[];
}, {
    salonId: string;
    tiers: {
        name: string;
        minPoints: number;
        benefits: string[];
    }[];
}>;
export type LoyaltyTierInput = z.infer<typeof loyaltyTierSchema>;
