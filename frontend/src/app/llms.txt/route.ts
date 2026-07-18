import { SITE } from "@getsalons/shared/constants";

/**
 * llms.txt — a plain-text guide for LLM / AI-search crawlers (GEO).
 * Serves a concise, structured overview of what GetSalons is and where the
 * important content lives, so generative engines can represent the site
 * accurately. Cached and regenerated periodically.
 */
export const revalidate = 86400; // once a day

export function GET(): Response {
  const body = `# GetSalons

> ${SITE.tagline}. GetSalons helps people across Pakistan discover, compare and book salons, barbers, spas and beauty parlours online — with verified reviews and transparent prices. Booking is free for customers.

## About

GetSalons is an online salon discovery and booking platform for Pakistan. Customers can:
- Search salons, barbers and spas by city and service.
- Compare prices and read reviews from verified customers.
- Book appointments online, or contact salons directly.
Salon owners can list their business for free, manage bookings, staff, services and deals, and grow through the platform.

Cities served include Lahore, Karachi, Islamabad and more across Pakistan.
Services covered include haircuts and hair colour, keratin and rebonding, bridal and party makeup, facials and skincare, manicures and pedicures, waxing and threading, men's grooming and barbering, and massage and spa treatments.

## Key pages

- [Find salons](${SITE.url}/salons): Search and filter salons by city, service and price.
- [Top salons](${SITE.url}/top-salons): The highest-rated salons on GetSalons.
- [Offers](${SITE.url}/offers): Current salon deals and discounts.
- [Beauty blog](${SITE.url}/blog): Guides on choosing salons, pricing, hair and skin care, bridal prep and more.
- [List your salon](${SITE.url}/partner): For salon owners who want to join GetSalons.
- [Contact](${SITE.url}/contact): Get in touch with the GetSalons team.

## Guides (blog)

Practical, Pakistan-specific guides answering common customer questions — how to choose a salon, what to expect at a first visit, online booking vs walk-in, spotting fake reviews, salon hygiene, how often to visit, city guides, hair-treatment explainers, gel vs acrylic nails, and finding ladies-only salons.

## More

- Sitemap: ${SITE.url}/sitemap.xml
- Facebook: ${SITE.socials.facebook}
- Instagram: ${SITE.socials.instagram}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  });
}
