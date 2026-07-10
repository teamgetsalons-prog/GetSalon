export type UserRole = "OWNER" | "STAFF" | "CUSTOMER";

export type SalonStatus = "DRAFT" | "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type GenderServed = "MALE" | "FEMALE" | "UNISEX";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type SubscriptionPlan = "TRIAL" | "BASIC" | "PRO" | "ENTERPRISE";

export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REMINDER"
  | "REVIEW_RECEIVED"
  | "SUBSCRIPTION_EXPIRING"
  | "PAYMENT_RECEIVED"
  | "SYSTEM";

export interface OpeningHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface GalleryImage {
  url: string;
  alt: string;
  order: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  staffId?: string;
}

export interface SalonCardData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  city: string;
  neighborhood: string | null;
  genderServed: GenderServed;
  isVerified: boolean;
  featured: boolean;
}

export interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  currency: string;
  category: string | null;
  image: string | null;
  active: boolean;
  staffIds: string[];
}

export interface StaffData {
  id: string;
  name: string;
  avatar: string | null;
  title: string | null;
  bio: string | null;
  serviceIds: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type SubscriptionPlanType = "TRIAL" | "BASIC" | "PRO" | "ENTERPRISE";

export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "PAUSED";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "CANCELED";

export interface SubscriptionPlanData {
  id: string;
  name: string;
  planType: SubscriptionPlanType;
  price: number;
  currency: string;
  interval: string;
  maxBookings: number | null;
  maxStaff: number | null;
  maxServices: number | null;
  features: string[];
  trialDays: number;
  active: boolean;
}

export interface SalonSubscriptionData {
  id: string;
  salonId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    createdAt: string;
  }[];
}

export interface LoyaltyAccountData {
  id: string;
  salonId: string;
  customerId: string;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransactionData {
  id: string;
  accountId: string;
  type: "EARN" | "REDEEM" | "EXPIRE" | "ADJUST";
  points: number;
  description: string;
  bookingId: string | null;
  createdAt: string;
}

export interface SalonAnalyticsData {
  salonId: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  newCustomers: number;
  returningCustomers: number;
  topServices: {
    serviceId: string;
    name: string;
    bookingCount: number;
    revenue: number;
  }[];
  bookingsByDay: {
    date: string;
    count: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}
