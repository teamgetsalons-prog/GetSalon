import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export async function serverFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    const body = await res.json().catch(() => null);
    if (!body) return { success: false, message: `Request failed (${res.status})` };
    return body;
  } catch {
    return { success: false, message: "Network error." };
  }
}

export interface SalonPublicData {
  _id: string;
  name: string;
  slug: string;
  cityName: string;
  areaName?: string;
  address: string;
  coverImage: string;
  description: string;
  about?: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  socials?: { facebook?: string; instagram?: string };
  genderServed: string;
  homeService: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  rating: { average: number; count: number };
  priceRange: { min: number; max: number };
  openingHours: { day: number; open: string; close: string; isClosed: boolean }[];
  gallery: { url: string; publicId?: string; caption?: string }[];
  faqs?: { question: string; answer: string }[];
  policies?: { cancellation?: string; notes?: string };
  location?: { coordinates: [number, number] };
}

export interface SalonPageData {
  salon: SalonPublicData;
  services: {
    _id: string;
    name: string;
    description?: string;
    duration: number;
    price: number;
    discountPrice?: number;
    isPopular?: boolean;
  }[];
  staff: {
    _id: string;
    name: string;
    title?: string;
    avatar?: string;
    services: string[];
    rating: { average: number; count: number };
  }[];
  reviews: Record<string, unknown>[];
}

export async function getSalonPageData(slug: string): Promise<SalonPageData | null> {
  const res = await serverFetch<SalonPageData>(`/salons/public/${slug}`);
  if (!res.success || !res.data) return null;
  return res.data;
}

import type { SalonCardData } from "@getsalons/shared/types";

export interface HomePageData {
  featured: SalonCardData[];
  topRated: SalonCardData[];
  newest: SalonCardData[];
  categories: { _id: string; name: string; slug: string; icon: string }[];
  cities: { _id: string; name: string; slug: string }[];
  stats: { salons: number; customers: number; bookings: number; cities: number };
}

export async function getHomePageData(): Promise<HomePageData | null> {
  const res = await serverFetch<HomePageData>("/salons/homepage");
  if (!res.success || !res.data) return null;
  return res.data;
}

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("getsalons_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; name: string; email: string; role: string; salonId?: string };
  } catch {
    return null;
  }
}
