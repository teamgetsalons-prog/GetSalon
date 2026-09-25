import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Search, Tag } from "lucide-react";
import { getSalonPageData, searchSalonsApi } from "@/lib/server-api";
import { IntentLandingPage } from "@/components/seo/intent-landing-page";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Salon Prices in Pakistan - Compare Service Costs | GetSalons",
    description:
      "Get salon prices before you book. Compare hair, facial, nails, bridal makeup and beauty service prices from salons across Pakistan with GetSalons.",
    keywords: [
      "get salons prices",
      "salon prices Pakistan",
      "salon price list",
      "haircut price Pakistan",
      "beauty salon price list",
      "bridal makeup package price",
    ],
    path: "/salon-prices",
  });
}

const priceCards = [
  { heading: "Compare service prices", title: "Haircut and hair prices", text: "Compare cuts, styling, colour and treatment menus from hair salons near you.", href: "/services/hair" },
  { heading: "Compare service prices", title: "Facial and skincare prices", text: "See where to compare facial, skincare and skin-treatment options before booking.", href: "/services/facial" },
  { heading: "Compare service prices", title: "Nail service prices", text: "Explore manicure, pedicure, nail art and extension services at local salons.", href: "/services/nails" },
  { heading: "Compare service prices", title: "Bridal package prices", text: "Find bridal makeup and wedding beauty packages, then ask about the inclusions.", href: "/services/bridal" },
];

export default async function SalonPricesPage() {
  const result = await searchSalonsApi({ sort: "price_low", limit: 8 }, { revalidate: 300 });
  let salonPages: Awaited<ReturnType<typeof getSalonPageData>>[] = [];
  try {
    salonPages = await Promise.all(
      result.salons.slice(0, 6).map((salon) =>
        getSalonPageData(salon.slug, { revalidate: 300 })
      )
    );
  } catch {
    // The explanatory price guide remains useful when the catalog is warming up.
  }
  const priceRows = salonPages
    .filter((data): data is NonNullable<typeof data> => Boolean(data))
    .flatMap((data) =>
      data.services
        .filter((service) => service.price > 0)
        .slice(0, 4)
        .map((service) => ({
          serviceName: service.name,
          salonName: data.salon.name,
          cityName: data.salon.cityName,
          price: service.discountPrice && service.discountPrice > 0
            ? service.discountPrice
            : service.price,
          priceMax: service.priceMax,
          href: `/salon/${data.salon.slug}#services`,
        }))
    );

  return (
    <IntentLandingPage
      path="/salon-prices"
      title="Get Salon Prices Before You Book"
      badge="Transparent beauty pricing"
      description="Compare salon price ranges and service menus across Pakistan. Find options for your budget, check what is included and book without guessing what a treatment will cost."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Salon Prices", path: "/salon-prices" },
      ]}
      primaryCta={{ label: "Compare salons and prices", href: "/salons?sort=price_low" }}
      secondaryCta={{ label: "Browse services", href: "/salon-services" }}
      features={[
        {
          icon: Search,
          title: "Find the right menu",
          text: "Search by service and city to find salons that publish relevant service details and starting prices.",
        },
        {
          icon: Tag,
          title: "Compare your options",
          text: "Look at price ranges, service inclusions, ratings and location together instead of comparing price alone.",
        },
        {
          icon: CheckCircle2,
          title: "Book with clarity",
          text: "Open the full salon profile to confirm the exact service price, duration and any salon-specific terms.",
        },
      ]}
      salons={result.salons}
      salonsHeading="Salons with prices to compare"
      salonsDescription="Use these listings as a starting point, then open a profile for its complete service menu."
      priceRows={priceRows}
      priceRowsHeading="Salon price list examples from live menus"
      linkCards={priceCards}
      sections={[
        {
          heading: "Get salon prices for popular services",
          paragraphs: [
            <>
              Searching for a salon price list? GetSalons brings service information into each salon profile so you can compare haircuts, hair colour, facials, nails, makeup, bridal packages, waxing and more. Start with the <Link href="/salon-services" className="font-medium text-gold hover:underline">service directory</Link>, select a category and open the salons that match your city.
            </>,
            "The final price may depend on hair length, product choice, treatment strength, specialist experience, salon location and the exact package selected. Treat a displayed starting price as a useful comparison point, and confirm the full menu before your appointment.",
          ],
        },
        {
          heading: "How to compare salon prices fairly",
          paragraphs: [
            "A low headline price is not always the lowest total cost. Check whether the price includes consultation, product, styling, finishing, taxes or a follow-up. Comparing the service description and duration alongside the price gives you a more useful picture of value.",
            <>
              If you want to save, check <Link href="/salon-offers-packages" className="font-medium text-gold hover:underline">salon offers and packages</Link> for bundled services and limited-time discounts. For quality signals, pair the price with <Link href="/salon-reviews" className="font-medium text-gold hover:underline">verified salon reviews</Link> and recent portfolio photos.
            </>,
          ],
        },
      ]}
      faqs={[
        {
          question: "How do I get salon prices on GetSalons?",
          answer: "Search for a salon or service, choose your city and open a salon profile. The profile can show a price range and individual service prices before you book.",
        },
        {
          question: "Why do salon prices vary?",
          answer: "Prices can vary by city, salon location, specialist experience, hair length, product choice, treatment complexity and what is included in the service or package.",
        },
        {
          question: "Can I compare haircut and hair colour prices?",
          answer: "Yes. Browse the hair service page or search by hair service, then compare the price information and service menus on individual salon profiles.",
        },
        {
          question: "Are the prices on GetSalons guaranteed?",
          answer: "Prices are supplied by participating salons and can change. Check the salon profile and confirm the final price and package inclusions with the salon before your appointment.",
        },
      ]}
      relatedLinks={[
        { label: "Find salons near me", href: "/salons-near-me", description: "Search nearby salons by service, rating and location." },
        { label: "Browse salon services", href: "/salon-services", description: "Explore the treatments whose prices you want to compare." },
        { label: "Salon reviews", href: "/salon-reviews", description: "Balance price with verified customer experiences." },
        { label: "Current offers", href: "/offers", description: "See live discounts from participating salons." },
        { label: "Salon packages", href: "/salon-offers-packages", description: "Compare bundled treatments and seasonal deals." },
        { label: "Top-rated salons", href: "/top-salons", description: "Start with salons known for strong customer ratings." },
      ]}
    />
  );
}
