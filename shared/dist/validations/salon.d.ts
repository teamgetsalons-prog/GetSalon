import { z } from "zod";
export declare const openingHourSchema: z.ZodEffects<z.ZodObject<{
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
}>, {
    day: number;
    open: string;
    close: string;
    isClosed: boolean;
}, {
    day: number;
    open: string;
    close: string;
    isClosed?: boolean | undefined;
}>;
export type OpeningHourInput = z.infer<typeof openingHourSchema>;
export declare const createSalonSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    about: z.ZodOptional<z.ZodString>;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    website: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
    address: z.ZodString;
    cityId: z.ZodString;
    areaId: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    genderServed: z.ZodDefault<z.ZodEnum<["men", "women", "unisex"]>>;
    homeService: z.ZodDefault<z.ZodBoolean>;
    whatsapp: z.ZodOptional<z.ZodString>;
    socials: z.ZodOptional<z.ZodObject<{
        facebook: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
        instagram: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
        tiktok: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        facebook?: string | undefined;
        instagram?: string | undefined;
        tiktok?: string | undefined;
    }, {
        facebook?: string | undefined;
        instagram?: string | undefined;
        tiktok?: string | undefined;
    }>>;
    coverImage: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    logo: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    openingHours: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
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
    }>, {
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
    galleryImages: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        alt: z.ZodString;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        url: string;
        alt: string;
        order: number;
    }, {
        url: string;
        alt: string;
        order: number;
    }>, "many">>;
    faqs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        answer: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        question: string;
        answer: string;
    }, {
        question: string;
        answer: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    description: string;
    address: string;
    cityId: string;
    genderServed: "men" | "women" | "unisex";
    homeService: boolean;
    email?: string | undefined;
    about?: string | undefined;
    website?: string | undefined;
    areaId?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    whatsapp?: string | undefined;
    socials?: {
        facebook?: string | undefined;
        instagram?: string | undefined;
        tiktok?: string | undefined;
    } | undefined;
    coverImage?: string | undefined;
    logo?: string | undefined;
    categoryIds?: string[] | undefined;
    openingHours?: {
        day: number;
        open: string;
        close: string;
        isClosed: boolean;
    }[] | undefined;
    galleryImages?: {
        url: string;
        alt: string;
        order: number;
    }[] | undefined;
    faqs?: {
        question: string;
        answer: string;
    }[] | undefined;
}, {
    name: string;
    phone: string;
    description: string;
    address: string;
    cityId: string;
    email?: string | undefined;
    about?: string | undefined;
    website?: string | undefined;
    areaId?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    genderServed?: "men" | "women" | "unisex" | undefined;
    homeService?: boolean | undefined;
    whatsapp?: string | undefined;
    socials?: {
        facebook?: string | undefined;
        instagram?: string | undefined;
        tiktok?: string | undefined;
    } | undefined;
    coverImage?: string | undefined;
    logo?: string | undefined;
    categoryIds?: string[] | undefined;
    openingHours?: {
        day: number;
        open: string;
        close: string;
        isClosed?: boolean | undefined;
    }[] | undefined;
    galleryImages?: {
        url: string;
        alt: string;
        order: number;
    }[] | undefined;
    faqs?: {
        question: string;
        answer: string;
    }[] | undefined;
}>;
export type CreateSalonInput = z.infer<typeof createSalonSchema>;
export declare const updateSalonSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    about: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    website: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>>;
    address: z.ZodOptional<z.ZodString>;
    cityId: z.ZodOptional<z.ZodString>;
    areaId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    latitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    genderServed: z.ZodOptional<z.ZodDefault<z.ZodEnum<["men", "women", "unisex"]>>>;
    homeService: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    whatsapp: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    socials: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        facebook: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
        instagram: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
        tiktok: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        facebook?: string | undefined;
        instagram?: string | undefined;
        tiktok?: string | undefined;
    }, {
        facebook?: string | undefined;
        instagram?: string | undefined;
        tiktok?: string | undefined;
    }>>>;
    coverImage: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    logo: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    categoryIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    openingHours: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
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
    }>, {
        day: number;
        open: string;
        close: string;
        isClosed: boolean;
    }, {
        day: number;
        open: string;
        close: string;
        isClosed?: boolean | undefined;
    }>, "many">>>;
    galleryImages: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        alt: z.ZodString;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        url: string;
        alt: string;
        order: number;
    }, {
        url: string;
        alt: string;
        order: number;
    }>, "many">>>;
    faqs: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        answer: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        question: string;
        answer: string;
    }, {
        question: string;
        answer: string;
    }>, "many">>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "suspended"]>>;
    tagline: z.ZodOptional<z.ZodString>;
    neighborhood: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    policies: z.ZodOptional<z.ZodObject<{
        cancellation: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        notes?: string | undefined;
        cancellation?: string | undefined;
    }, {
        notes?: string | undefined;
        cancellation?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "pending" | "approved" | "rejected" | "suspended" | undefined;
    description?: string | undefined;
    about?: string | undefined;
    website?: string | undefined;
    address?: string | undefined;
    cityId?: string | undefined;
    areaId?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    genderServed?: "men" | "women" | "unisex" | undefined;
    homeService?: boolean | undefined;
    whatsapp?: string | undefined;
    socials?: {
        facebook?: string | undefined;
        instagram?: string | undefined;
        tiktok?: string | undefined;
    } | undefined;
    coverImage?: string | undefined;
    logo?: string | undefined;
    categoryIds?: string[] | undefined;
    openingHours?: {
        day: number;
        open: string;
        close: string;
        isClosed: boolean;
    }[] | undefined;
    galleryImages?: {
        url: string;
        alt: string;
        order: number;
    }[] | undefined;
    faqs?: {
        question: string;
        answer: string;
    }[] | undefined;
    tagline?: string | undefined;
    neighborhood?: string | undefined;
    postalCode?: string | undefined;
    policies?: {
        notes?: string | undefined;
        cancellation?: string | undefined;
    } | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "pending" | "approved" | "rejected" | "suspended" | undefined;
    description?: string | undefined;
    about?: string | undefined;
    website?: string | undefined;
    address?: string | undefined;
    cityId?: string | undefined;
    areaId?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    genderServed?: "men" | "women" | "unisex" | undefined;
    homeService?: boolean | undefined;
    whatsapp?: string | undefined;
    socials?: {
        facebook?: string | undefined;
        instagram?: string | undefined;
        tiktok?: string | undefined;
    } | undefined;
    coverImage?: string | undefined;
    logo?: string | undefined;
    categoryIds?: string[] | undefined;
    openingHours?: {
        day: number;
        open: string;
        close: string;
        isClosed?: boolean | undefined;
    }[] | undefined;
    galleryImages?: {
        url: string;
        alt: string;
        order: number;
    }[] | undefined;
    faqs?: {
        question: string;
        answer: string;
    }[] | undefined;
    tagline?: string | undefined;
    neighborhood?: string | undefined;
    postalCode?: string | undefined;
    policies?: {
        notes?: string | undefined;
        cancellation?: string | undefined;
    } | undefined;
}>;
export type UpdateSalonInput = z.infer<typeof updateSalonSchema>;
export declare const searchSalonsSchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    area: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    service: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["men", "women", "unisex"]>>;
    homeService: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    openNow: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    deals: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    rating: z.ZodOptional<z.ZodNumber>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodEnum<["recommended", "rating", "reviews", "price_low", "price_high", "newest", "featured"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    rating?: number | undefined;
    sort?: "recommended" | "rating" | "reviews" | "price_low" | "price_high" | "newest" | "featured" | undefined;
    city?: string | undefined;
    homeService?: boolean | undefined;
    q?: string | undefined;
    area?: string | undefined;
    category?: string | undefined;
    service?: string | undefined;
    gender?: "men" | "women" | "unisex" | undefined;
    openNow?: boolean | undefined;
    deals?: boolean | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}, {
    rating?: number | undefined;
    sort?: "recommended" | "rating" | "reviews" | "price_low" | "price_high" | "newest" | "featured" | undefined;
    city?: string | undefined;
    homeService?: unknown;
    q?: string | undefined;
    area?: string | undefined;
    category?: string | undefined;
    service?: string | undefined;
    gender?: "men" | "women" | "unisex" | undefined;
    openNow?: unknown;
    deals?: unknown;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type SearchSalonsInput = z.infer<typeof searchSalonsSchema>;
