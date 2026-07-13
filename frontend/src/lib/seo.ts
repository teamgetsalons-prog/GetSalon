import type { Metadata } from "next";
import { SITE } from "@getsalons/shared/constants";
import { absoluteUrl, truncate } from "./utils";

/**
 * SEO helpers: metadata builder + Schema.org JSON-LD generators.
 * Used by server components only.
 */

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(opts.path);
  const description = truncate(opts.description, 160);
  const images = opts.image ? [{ url: opts.image }] : undefined;

  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : undefined,
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
      card: opts.image ? "summary_large_image" : "summary",
      site: SITE.twitter,
      title: opts.title,
      description,
      images: opts.image ? [opts.image] : undefined,
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
    sameAs: [
      "https://www.facebook.com/getsalonsPK",
      "https://www.instagram.com/getsalonsPK",
      "https://www.tiktok.com/@getsalonsPK",
    ],
    description: SITE.description,
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
