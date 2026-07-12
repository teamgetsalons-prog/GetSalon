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
  | "review_received"
  | "review_reply"
  | "salon_approved"
  | "salon_rejected"
  | "subscription_expiry"
  | "subscription_expiring"
  | "trial_expiry_warning"
  | "support_reply"
  | "system";

export interface OpeningHour {
  day: number;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface GalleryImage {
  url: string;
  alt?: string;
  order?: number;
  publicId?: string;
  caption?: string;
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
  start?: string;
  end?: string;
  available?: boolean;
  staffId?: string;
  staffName?: string;
  minutes?: number;
  time?: string;
}

export interface SalonCardData {
  _id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  cityName: string;
  areaName: string | null | undefined;
  genderServed: GenderServed;
  homeService: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  rating: { average: number; count: number };
  priceRange: { min: number; max: number };
  categoryNames: string[];
  tagline?: string | null;
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
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export interface CommentData {
  _id: string;
  customer: { _id: string; name: string; avatar?: string };
  salon: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  city?: string;
}
