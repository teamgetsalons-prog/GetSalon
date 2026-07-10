import type { MetadataRoute } from "next";
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { SITE } from "@getsalons/shared/constants";

/**
 * Dynamic sitemap: static pages + every approved salon, city listing,
 * category listing and published blog post.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/salons`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/top-salons`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/partner`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    await connectDB();

    const [salons, cities, categories, posts] = await Promise.all([
      Salon.find({ status: "approved" }).select("slug updatedAt"),
      City.find({ isActive: true }).select("slug"),
      Category.find({ isActive: true }).select("slug"),
      BlogPost.find({ isPublished: true }).select("slug updatedAt"),
    ]);

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

    return [
      ...staticPages,
      ...salons.map((s) => ({
        url: `${SITE.url}/salon/${s.slug}`,
        lastModified: s.updatedAt,
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
      // Blog posts
      ...posts.map((p) => ({
        url: `${SITE.url}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return staticPages;
  }
}
