import type { MetadataRoute } from "next";
import { SITE } from "@getsalons/shared/constants";
import { getCategoriesApi, getCitiesApi, searchSalonsApi } from "@/lib/server-api";

/**
 * Dynamic sitemap: static pages + approved salons, city landing pages,
 * category listings and service landing pages (all fetched from the API).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/salons`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/top-salons`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/partner`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const serviceSlugs = [
    "hair",
    "makeup",
    "facial",
    "nails",
    "bridal",
    "massage",
    "skin-care",
    "waxing",
  ];

  try {
    const [salons, cities, categories] = await Promise.all([
      searchSalonsApi({ limit: 50, sort: "newest" }),
      getCitiesApi(),
      getCategoriesApi(),
    ]);

    return [
      ...staticPages,
      ...salons.salons.map((s) => ({
        url: `${SITE.url}/salon/${s.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      // City landing pages
      ...cities.map((c) => ({
        url: `${SITE.url}/salons/${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
      // Category search pages
      ...categories.map((c) => ({
        url: `${SITE.url}/salons?category=${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.6,
      })),
      // Service landing pages
      ...serviceSlugs.map((s) => ({
        url: `${SITE.url}/services/${s}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticPages;
  }
}
