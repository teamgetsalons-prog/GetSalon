import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, MapPin, SlidersHorizontal } from "lucide-react";
import { getCitiesApi, searchSalonsApi } from "@/lib/server-api";
import { IntentLandingPage } from "@/components/seo/intent-landing-page";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Salons Near Me in Pakistan - Find & Book Nearby | GetSalons",
    description:
      "Get salons near me in Pakistan. Find nearby beauty salons, hair salons, barbers and spas, compare prices and reviews, and book online for free.",
    keywords: [
      "get salons near me",
      "salon near me",
      "beauty salon near me",
      "hair salon near me",
      "barber shop near me",
      "salons in Pakistan",
    ],
    path: "/salons-near-me",
  });
}

export default async function SalonsNearMePage() {
  const [result, cities] = await Promise.all([
    searchSalonsApi({ sort: "rating", limit: 8 }, { revalidate: 300 }),
    getCitiesApi(false, true, { revalidate: 300 }),
  ]);

  const cityLinks = cities.slice(0, 6).map((city) => ({
    label: `Salons in ${city.name}`,
    href: `/salons/${city.slug}`,
    description: `Browse beauty salons, parlours and appointment options in ${city.name}.`,
  }));

  return (
    <IntentLandingPage
      path="/salons-near-me"
      title="Find Salons Near Me and Book With Confidence"
      badge="Local salon discovery"
      description="Search nearby beauty salons, hair salons, barbers and spas across Pakistan. Compare real prices, read verified reviews and choose an appointment that fits your day."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Salons Near Me", path: "/salons-near-me" },
      ]}
      primaryCta={{ label: "Search salons near me", href: "/salons" }}
      secondaryCta={{ label: "See top-rated salons", href: "/top-salons" }}
      features={[
        {
          icon: MapPin,
          title: "Search by city and area",
          text: "Start with your city, then open a salon profile to check its address, opening hours and directions.",
        },
        {
          icon: SlidersHorizontal,
          title: "Filter what matters",
          text: "Narrow results by service, price range, rating, gender preference and home-service availability.",
        },
        {
          icon: CalendarCheck,
          title: "Book online for free",
          text: "Choose a service and available time slot without paying a booking fee to GetSalons.",
        },
      ]}
      salons={result.salons}
      salonsHeading="Popular salons across Pakistan"
      salonsDescription="Use these highly rated listings as a starting point, then choose your city to find a salon near you."
      sections={[
        {
          heading: "How to get salons near me on GetSalons",
          paragraphs: [
            <>
              Enter a salon name, treatment or service on the <Link href="/salons" className="font-medium text-gold hover:underline">salon search page</Link>, then select your city. You can open each listing to see services, prices, photos, opening hours and booking availability before you decide.
            </>,
            <>
              Looking for a specific treatment? Browse <Link href="/salon-services" className="font-medium text-gold hover:underline">salon services</Link> such as haircuts, hair colour, facials, bridal makeup, manicures, pedicures, waxing and massage. For a quick shortlist, start with <Link href="/salon-reviews" className="font-medium text-gold hover:underline">salon reviews</Link> and compare verified customer feedback.
            </>,
          ],
        },
        {
          heading: "Choose the right nearby salon",
          paragraphs: [
            "The closest salon is not always the best match. Check whether the salon offers the treatment you need, review its starting price and confirm the location is convenient. A verified profile, clear service menu and recent customer reviews make it easier to book with confidence.",
            <>
              If price is your priority, use our <Link href="/salon-prices" className="font-medium text-gold hover:underline">salon price guide</Link> to understand what to compare. If you want a discount, check current <Link href="/salon-offers-packages" className="font-medium text-gold hover:underline">salon offers and packages</Link> before booking.
            </>,
          ],
        },
      ]}
      faqs={[
        {
          question: "How do I find salons near my location?",
          answer: "Choose your city on the GetSalons search page and filter by service, price, rating or home service. Open a salon profile to check its exact address and directions.",
        },
        {
          question: "Can I find a hair salon near me?",
          answer: "Yes. Search for hair, choose your city, or browse the hair service directory to compare hair salons, prices, ratings and available appointments.",
        },
        {
          question: "Is salon booking on GetSalons free?",
          answer: "Yes. Customers can search and book through GetSalons for free. You pay the salon for the service you receive according to its listed price and policies.",
        },
        {
          question: "Do salons near me offer home service?",
          answer: "Many listed salons offer home service. Use the home-service filter or look for the home-service label on a salon profile.",
        },
      ]}
      relatedLinks={[
        ...cityLinks,
        {
          label: "Browse salon services",
          href: "/salon-services",
          description: "Find salons by haircut, facial, nails, bridal makeup and more.",
        },
        {
          label: "Compare salon prices",
          href: "/salon-prices",
          description: "See how to check service prices before booking.",
        },
        {
          label: "Read salon reviews",
          href: "/salon-reviews",
          description: "Start with highly rated salons and verified feedback.",
        },
      ]}
    />
  );
}
