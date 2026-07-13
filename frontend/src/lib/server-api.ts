import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// Server-to-server: talk to the backend directly. Same resolution as the
// /api proxy in next.config.ts - hardcoded default, API_PROXY_URL override.
// (Deliberately not NEXT_PUBLIC_API_URL; a wrong value there has broken
// production before, and client code no longer uses it at all.)
const API_BASE =
  process.env.API_PROXY_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://getsalon.onrender.com"
    : "http://localhost:3001");
// The backend signs tokens with its AUTH_SECRET — this MUST be set to the
// exact same value on the frontend (Vercel) as on the backend (Render),
// or every server-rendered session check below will silently fail.
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export async function serverFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<{
  success: boolean;
  data?: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}> {
  try {
    // Forward the visitor's cookies so authenticated endpoints work in RSC
    let cookieHeader = "";
    try {
      cookieHeader = (await cookies()).toString();
    } catch {
      // called outside a request scope (e.g. sitemap) — fine, stay anonymous
    }

    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const res = await fetch(url, {
      cache: "no-store",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...options?.headers,
      },
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
  logo?: string;
  description: string;
  about?: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  socials?: { facebook?: string; instagram?: string; tiktok?: string };
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
  categories?: { _id: string; name: string; slug: string }[];
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

// ── Search / catalog helpers ────────────────────────────────

export interface SearchSalonsResult {
  salons: SalonCardData[];
  total: number;
  page: number;
  totalPages: number;
}

/** GET /salons with any subset of the public search filters */
export async function searchSalonsApi(
  params: Record<string, string | number | boolean | undefined>
): Promise<SearchSalonsResult> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const res = await serverFetch<SalonCardData[]>(`/salons?${qs.toString()}`);
  if (!res.success || !res.data) {
    return { salons: [], total: 0, page: 1, totalPages: 0 };
  }
  return {
    salons: res.data,
    total: res.pagination?.total ?? res.data.length,
    page: res.pagination?.page ?? 1,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

export interface CityOption {
  _id: string;
  name: string;
  slug: string;
  areas?: { _id: string; name: string; slug: string }[];
}

export interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export async function getCitiesApi(withAreas = false, onlyWithSalons = false): Promise<CityOption[]> {
  const params = new URLSearchParams();
  if (withAreas) params.set("withAreas", "1");
  if (onlyWithSalons) params.set("onlyWithSalons", "1");
  const qs = params.toString();
  const res = await serverFetch<CityOption[]>(
    `/categories/cities${qs ? `?${qs}` : ""}`
  );
  return res.success && res.data ? res.data : [];
}

export async function getCategoriesApi(): Promise<CategoryOption[]> {
  const res = await serverFetch<CategoryOption[]>("/categories");
  return res.success && res.data ? res.data : [];
}

/** Shape of the full salon document the owner dashboard works with */
export interface ManagedSalon extends SalonPublicData {
  status: "pending" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  email?: string;
  views: number;
}

/** Full salon document for the logged-in owner/staff (via session.salonId) */
export async function getManagedSalon(): Promise<ManagedSalon | null> {
  const session = await getServerSession();
  if (!session?.salonId) return null;
  const res = await serverFetch<ManagedSalon>(`/salons/${session.salonId}`);
  return res.success && res.data ? res.data : null;
}

// ── Blog helpers ────────────────────────────────────────

export interface BlogPostPublic {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt?: Date;
  views: number;
  seo?: { title?: string; description?: string };
}

export async function getBlogPosts(opts: {
  page?: number;
  limit?: number;
  category?: string;
} = {}): Promise<{
  posts: BlogPostPublic[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams();
  if (opts.page) qs.set("page", String(opts.page));
  if (opts.limit) qs.set("limit", String(opts.limit));
  if (opts.category) qs.set("category", opts.category);

  const res = await serverFetch<BlogPostPublic[]>(`/blog?${qs.toString()}`);
  if (!res.success || !res.data) {
    return { posts: [], total: 0, page: 1, totalPages: 0 };
  }
  return {
    posts: res.data,
    total: res.pagination?.total ?? res.data.length,
    page: res.pagination?.page ?? 1,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

export async function getBlogPost(
  slug: string
): Promise<BlogPostPublic | null> {
  const res = await serverFetch<BlogPostPublic>(`/blog/${slug}`);
  if (!res.success || !res.data) return null;
  return res.data;
}

// ── Deals ──────────────────────────────────────────────────

export interface DealPublic {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  service?: { _id: string; name: string; price: number; discountPrice?: number } | null;
  serviceName?: string;
  image?: string;
  terms?: string;
  maxRedemptions?: number;
  redemptionCount: number;
  isActive: boolean;
  isFeatured: boolean;
  startDate?: string;
  endDate?: string;
  salon: {
    _id: string;
    name: string;
    slug: string;
    coverImage: string | null;
    cityName: string;
    areaName?: string;
    address?: string;
    phone?: string;
    rating: { average: number; count: number };
    isVerified: boolean;
    isFeatured: boolean;
  } | null;
}

export interface DealsResult {
  deals: DealPublic[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getDealsApi(
  params: Record<string, string | number | boolean> = {}
): Promise<DealsResult> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const res = await serverFetch<{ data: DealPublic[]; pagination?: { page: number; total: number; totalPages: number } }>(
    `/deals?${q}`
  );
  const data = res.data;
  return {
    deals: Array.isArray(data) ? data : (data?.data ?? []),
    total: data?.pagination?.total ?? (Array.isArray(data) ? data.length : 0),
    page: data?.pagination?.page ?? 1,
    totalPages: data?.pagination?.totalPages ?? 1,
  };
}

export async function getDealById(
  id: string
): Promise<DealPublic | null> {
  const res = await serverFetch<DealPublic>(`/deals/${id}`);
  if (!res.success || !res.data) return null;
  return res.data;
}

export async function getSalonDeals(
  salonId: string
): Promise<DealPublic[]> {
  const res = await serverFetch<DealPublic[]>(`/deals?salonId=${salonId}`);
  if (!res.success || !res.data) return [];
  const data = res.data;
  return Array.isArray(data) ? data : [];
}
