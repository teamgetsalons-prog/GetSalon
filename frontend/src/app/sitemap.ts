import type { MetadataRoute } from "next";
import { SITE } from "@getsalons/shared/constants";
import { getCategoriesApi, getCitiesApi, searchSalonsApi, getBlogPosts } from "@/lib/server-api";

/**
 * Dynamic sitemap: static pages + approved salons, city landing pages,
 * category listings and service landing pages (all fetched from the API).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/salons`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/top-salons`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/offers`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/partner`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/privacy`, changeFrequency: "yearly", priority: 0.3 },
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
    const [salons, cities, categories, blogResult] = await Promise.all([
      searchSalonsApi({ limit: 200, sort: "newest" }),
      getCitiesApi(),
      getCategoriesApi(),
      getBlogPosts({ limit: 100 }),
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
      // Service landing pages (path-based, SEO-friendly)
      ...serviceSlugs.map((s) => ({
        url: `${SITE.url}/services/${s}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
      // City + service combo pages
      ...cities.flatMap((c) =>
        serviceSlugs.slice(0, 4).map((s) => ({
          url: `${SITE.url}/salons/${c.slug}/${s}`,
          changeFrequency: "daily" as const,
          priority: 0.6,
        }))
      ),
      // Blog posts
      ...blogResult.posts.map((p) => ({
        url: `${SITE.url}/blog/${p.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
      })),
    ];
  } catch {
    return staticPages;
  }
}
