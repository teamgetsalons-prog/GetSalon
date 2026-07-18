import type { Metadata } from "next";
import { SITE } from "@getsalons/shared/constants";
import { absoluteUrl, truncate } from "./utils";

/** Branded 1200x630 share card used as the default OG/Twitter image when a
 * page doesn't supply its own. Ensures every page has an og:image. */
export const DEFAULT_OG_IMAGE = absoluteUrl("/og-image.png");

/**
 * SEO helpers: metadata builder + Schema.org JSON-LD generators.
 * Used by server components only.
 */

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Fully blocks indexing AND link-following - for pages that should never surface anywhere. */
  noIndex?: boolean;
  /**
   * Explicit `false` = "noindex, follow": the page itself shouldn't rank (e.g. a
   * thin/empty programmatic page), but crawlers should still follow its links to
   * discover the rest of the site. Distinct from `noIndex`, which blocks both.
   */
  index?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(opts.path);
  const description = truncate(opts.description, 160);
  // Fall back to the branded default share card so every page has an og:image.
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const images = [{ url: image, width: 1200, height: 630, alt: opts.title }];

  const robots = opts.noIndex
    ? { index: false, follow: false }
    : opts.index === false
      ? { index: false, follow: true }
      : undefined;

  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    robots,
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: opts.type ?? "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter,
      title: opts.title,
      description,
      images: [image],
    },
  };
}

// ── Schema.org builders ─────────────────────────────────────

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/icon.svg"),
    image: DEFAULT_OG_IMAGE,
    sameAs: [SITE.socials.facebook, SITE.socials.instagram],
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    areaServed: { "@type": "Country", name: "Pakistan" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: "+92-309-8899061",
      email: "team.getsalons@gmail.com",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    knowsAbout: [
      "salon booking",
      "hair salons",
      "barbers",
      "beauty parlours",
      "bridal makeup",
      "skincare",
      "nail salons",
      "spa and massage",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/salons?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function salonJsonLd(salon: {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  address: string;
  cityName: string;
  phone: string;
  rating: { average: number; count: number };
  priceRange: { min: number; max: number };
  location?: { coordinates: [number, number] };
  openingHours?: { day: number; open: string; close: string; isClosed: boolean }[];
}) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: salon.name,
    url: absoluteUrl(`/salon/${salon.slug}`),
    image: salon.coverImage,
    description: salon.description,
    telephone: salon.phone,
    priceRange:
      salon.priceRange.min > 0
        ? `PKR ${salon.priceRange.min}-${salon.priceRange.max}`
        : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.address,
      addressLocality: salon.cityName,
      addressCountry: "PK",
    },
    ...(salon.location?.coordinates
      ? {
          geo: {
            "@type": "GeoCoordinates",
            longitude: salon.location.coordinates[0],
            latitude: salon.location.coordinates[1],
          },
        }
      : {}),
    ...(salon.rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: salon.rating.average,
            reviewCount: salon.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(salon.openingHours?.length
      ? {
          openingHoursSpecification: salon.openingHours
            .filter((h) => !h.isClosed)
            .map((h) => ({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: days[h.day],
              opens: h.open,
              closes: h.close,
            })),
        }
      : {}),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
