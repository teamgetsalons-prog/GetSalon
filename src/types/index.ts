/**
 * Shared domain types used by BOTH frontend and backend.
 * Keep this file free of any server-only imports (mongoose, node APIs).
 */

export type UserRole = "customer" | "owner" | "staff" | "admin";

export type SalonStatus = "pending" | "approved" | "rejected" | "suspended";

export type GenderServed = "men" | "women" | "unisex";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type SubscriptionPlan = "free" | "premium" | "business";

export type NotificationType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_rescheduled"
  | "booking_reminder"
  | "review_received"
  | "review_reply"
  | "salon_approved"
  | "salon_rejected"
  | "subscription_expiry"
  | "trial_expiry_warning"
  | "system";

export interface OpeningHour {
  /** 0 = Sunday … 6 = Saturday (JS Date convention) */
  day: number;
  open: string; // "09:00"
  close: string; // "21:00"
  isClosed: boolean;
}

export interface GalleryImage {
  url: string;
  publicId?: string;
  caption?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GeoPoint {
  type: "Point";
  /** [longitude, latitude] */
  coordinates: [number, number];
}

/** Availability slot returned by the availability API */
export interface TimeSlot {
  time: string; // "14:30"
  minutes: number; // 870
  staffId?: string;
  staffName?: string;
}

/** Lean shapes the frontend consumes (serialized, _id as string) */
export interface SalonCardData {
  _id: string;
  name: string;
  slug: string;
  coverImage: string;
  cityName: string;
  areaName?: string;
  genderServed: GenderServed;
  homeService: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  rating: { average: number; count: number };
  priceRange: { min: number; max: number };
  categoryNames?: string[];
}

export interface ServiceData {
  _id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  discountPrice?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  categoryName?: string;
}

export interface StaffData {
  _id: string;
  name: string;
  title?: string;
  avatar?: string;
  rating?: { average: number; count: number };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Subscription types
export type SubscriptionPlanType = "trial" | "basic" | "premium";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "suspended";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";

export interface SubscriptionPlanData {
  name: string;
  slug: SubscriptionPlanType;
  price: number;
  duration: number;
  features: Record<string, boolean>;
}

export interface SalonSubscriptionData {
  _id: string;
  salon: string;
  plan: SubscriptionPlanType;
  status: SubscriptionStatus;
  trialStartDate?: string;
  trialEndDate?: string;
  startDate: string;
  expiryDate: string;
  renewalDate?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  invoiceNumber: string;
}

// Loyalty types
export interface LoyaltyAccountData {
  _id: string;
  customer: string;
  totalPoints: number;
  earnedPoints: number;
  redeemedPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export interface LoyaltyTransactionData {
  _id: string;
  account: string;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  points: number;
  description: string;
  createdAt: string;
}

// Analytics types
export interface SalonAnalyticsData {
  profileViews: number;
  bookingRequests: number;
  completedBookings: number;
  phoneClicks: number;
  whatsappClicks: number;
  reviewCount: number;
  averageRating: number;
  revenue: number;
  subscriptionStatus: string;
}
