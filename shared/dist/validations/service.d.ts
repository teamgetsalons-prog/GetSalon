import { z } from "zod";
export declare const serviceSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    duration: z.ZodNumber;
    price: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    image: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isPopular: z.ZodDefault<z.ZodBoolean>;
    discountPrice: z.ZodOptional<z.ZodUnion<[z.ZodNull, z.ZodNumber]>>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    name: string;
    duration: number;
    price: number;
    isActive: boolean;
    isPopular: boolean;
    description?: string | undefined;
    categoryId?: string | undefined;
    image?: string | undefined;
    discountPrice?: number | null | undefined;
}, {
    name: string;
    duration: number;
    price: number;
    currency?: string | undefined;
    description?: string | undefined;
    categoryId?: string | undefined;
    image?: string | undefined;
    isActive?: boolean | undefined;
    isPopular?: boolean | undefined;
    discountPrice?: number | null | undefined;
}>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export declare const staffSchema: z.ZodObject<{
    name: z.ZodString;
    avatar: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    title: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    serviceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    workingHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
        day: z.ZodNumber;
        open: z.ZodString;
        close: z.ZodString;
        isClosed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        day: number;
        open: string;
        close: string;
        isClosed: boolean;
    }, {
        day: number;
        open: string;
        close: string;
        isClosed?: boolean | undefined;
    }>, "many">>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    avatar?: string | undefined;
    title?: string | undefined;
    bio?: string | undefined;
    serviceIds?: string[] | undefined;
    workingHours?: {
        day: number;
        open: string;
        close: string;
        isClosed: boolean;
    }[] | undefined;
}, {
    name: string;
    avatar?: string | undefined;
    isActive?: boolean | undefined;
    title?: string | undefined;
    bio?: string | undefined;
    serviceIds?: string[] | undefined;
    workingHours?: {
        day: number;
        open: string;
        close: string;
        isClosed?: boolean | undefined;
    }[] | undefined;
}>;
export type StaffInput = z.infer<typeof staffSchema>;
