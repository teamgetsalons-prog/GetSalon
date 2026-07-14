import type { MetadataRoute } from "next";
import { SITE } from "@getsalons/shared/constants";
import { getCitiesApi, searchSalonsApi, getBlogPosts } from "@/lib/server-api";

// The sitemap itself doesn't need to be regenerated on every crawl request -
// it's cached for an hour, which also caps how often the (fairly expensive)
// full-catalog pagination loop and combo-page existence checks below run.
export const revalidate = 3600;

const SALON_FETCH_OPTS = { revalidate: 3600 };

/**
 * Every approved salon's slug, fetched by walking the search API's own
 * pagination (capped at 50/page server-side) instead of asking for an
 * unbounded page in one call - which the backend silently truncated to 50
 * results regardless of what was requested. Fetches a few pages at a time
 * rather than all at once to keep memory and backend load bounded.
 */
async function fetchAllApprovedSalonSlugs(): Promise<string[]> {
  const PAGE_LIMIT = 50;
  const BATCH_SIZE = 5; // concurrent page requests per round
  const MAX_PAGES = 500; // safety cap (~25k salons) against a runaway loop

  const first = await searchSalonsApi(
    { limit: PAGE_LIMIT, page: 1, sort: "newest" },
    SALON_FETCH_OPTS
  );
  const slugs = first.salons.map((s) => s.slug);
  const totalPages = Math.min(first.totalPages, MAX_PAGES);

  let page = 2;
  while (page <= totalPages) {
    const batch: Promise<Awaited<ReturnType<typeof searchSalonsApi>>>[] = [];
    for (let i = 0; i < BATCH_SIZE && page <= totalPages; i++, page++) {
      batch.push(searchSalonsApi({ limit: PAGE_LIMIT, page, sort: "newest" }, SALON_FETCH_OPTS));
    }
    const results = await Promise.all(batch);
    for (const r of results) slugs.push(...r.salons.map((s) => s.slug));
  }

  return slugs;
}

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
    const [salonSlugs, cities, blogResult] = await Promise.all([
      fetchAllApprovedSalonSlugs(),
      getCitiesApi(false, false, SALON_FETCH_OPTS),
      getBlogPosts({ limit: 100 }),
    ]);

    // Only advertise a city+service combo URL if it actually has a matching
    // salon right now - otherwise it's the exact thin/empty page the site's
    // own noindex logic (salons/[city]/[service]/page.tsx) would immediately
    // deindex anyway, so there's no point pointing crawlers at it.
    const comboCandidates = cities.flatMap((c) =>
      serviceSlugs.slice(0, 4).map((s) => ({ city: c.slug, service: s }))
    );
    const comboChecks = await Promise.all(
      comboCandidates.map(async ({ city, service }) => {
        let result = await searchSalonsApi({ city, category: service, limit: 1 }, SALON_FETCH_OPTS);
        if (result.total === 0) {
          result = await searchSalonsApi({ city, q: service, limit: 1 }, SALON_FETCH_OPTS);
        }
        return result.total > 0 ? { city, service } : null;
      })
    );
    const comboPages: MetadataRoute.Sitemap = comboChecks
      .filter((c): c is { city: string; service: string } => c !== null)
      .map(({ city, service }) => ({
        url: `${SITE.url}/salons/${city}/${service}`,
        changeFrequency: "daily" as const,
        priority: 0.6,
      }));

    return [
      ...staticPages,
      ...salonSlugs.map((slug) => ({
        url: `${SITE.url}/salon/${slug}`,
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
      // City + service combo pages - only the ones with real listings
      ...comboPages,
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
