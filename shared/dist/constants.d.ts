export declare const SITE: {
    readonly name: "GetSalons";
    readonly shortName: "GetSalons";
    readonly tagline: "Pakistan's #1 Salon Discovery & Booking Platform";
    readonly description: "Discover and book the best salons, barbers, spas and beauty parlours across Pakistan. Compare prices, read verified reviews and book appointments online — free.";
    readonly url: string;
    readonly locale: "en_PK";
    readonly twitter: "@getsalonsPK";
};
export declare const ROLES: {
    readonly CUSTOMER: "customer";
    readonly OWNER: "owner";
    readonly STAFF: "staff";
    readonly ADMIN: "admin";
};
export declare const BOOKING_STATUSES: readonly ["pending", "confirmed", "completed", "cancelled", "no_show"];
export declare const BOOKING_STATUS_LABELS: Record<string, string>;
export declare const DAYS: readonly ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export declare const SLOT_INTERVAL = 30;
export declare const MAX_BOOKING_DAYS_AHEAD = 30;
export declare const MIN_BOOKING_LEAD_MINUTES = 60;
export declare const PAGE_SIZE = 12;
/** Owner-selectable salon highlights, shown as a checklist below the hero image */
export declare const SALON_AMENITIES: readonly [{
    readonly key: "femaleStaff";
    readonly label: "Female Staff";
}, {
    readonly key: "parking";
    readonly label: "Parking";
}, {
    readonly key: "ac";
    readonly label: "Air Conditioned";
}, {
    readonly key: "wifi";
    readonly label: "WiFi";
}, {
    readonly key: "cardAccepted";
    readonly label: "Card Accepted";
}, {
    readonly key: "bridalSpecialist";
    readonly label: "Bridal Specialist";
}];
export declare const GENDER_OPTIONS: readonly [{
    readonly value: "men";
    readonly label: "Men Only";
}, {
    readonly value: "women";
    readonly label: "Women Only";
}, {
    readonly value: "unisex";
    readonly label: "Unisex";
}];
export declare const SORT_OPTIONS: readonly [{
    readonly value: "recommended";
    readonly label: "Recommended";
}, {
    readonly value: "rating";
    readonly label: "Highest Rated";
}, {
    readonly value: "reviews";
    readonly label: "Most Reviewed";
}, {
    readonly value: "price_low";
    readonly label: "Price: Low to High";
}, {
    readonly value: "price_high";
    readonly label: "Price: High to Low";
}, {
    readonly value: "newest";
    readonly label: "Newest";
}];
export declare const SITE_FAQS: {
    question: string;
    answer: string;
}[];
export declare const TESTIMONIALS: {
    name: string;
    city: string;
    text: string;
    rating: number;
}[];
