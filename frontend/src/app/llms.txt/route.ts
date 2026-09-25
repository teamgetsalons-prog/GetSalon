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
- [Salons near me](${SITE.url}/salons-near-me): Find nearby salons and book appointments.
- [Salon services](${SITE.url}/salon-services): Browse hair, makeup, nails, skincare, bridal and spa services.
- [Salon prices](${SITE.url}/salon-prices): Compare service price information before booking.
- [Salon reviews](${SITE.url}/salon-reviews): Read verified feedback and find top-rated salons.
- [Top salons](${SITE.url}/top-salons): The highest-rated salons on GetSalons.
- [Offers](${SITE.url}/offers): Current salon deals and discounts.
- [Salon offers and packages](${SITE.url}/salon-offers-packages): Explore discounts and bundled beauty treatments.
- [Free salon booking app](${SITE.url}/free-salon-booking-app): Book beauty appointments online at no customer booking fee.
- [Best free salon booking system](${SITE.url}/best-free-salon-booking-system): Free-to-start discovery and booking tools for salon owners.
- [Hair salon search alternative](${SITE.url}/fresha-hair-salon-near-me): Compare local hair salons independently from Fresha.
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
