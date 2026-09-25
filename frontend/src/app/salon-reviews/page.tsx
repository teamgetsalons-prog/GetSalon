import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Star } from "lucide-react";
import { searchSalonsApi } from "@/lib/server-api";
import { IntentLandingPage } from "@/components/seo/intent-landing-page";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Salon Reviews in Pakistan - Find Top-Rated Salons | GetSalons",
    description:
      "Get salon reviews from real customers in Pakistan. Compare ratings, read verified feedback and find top-rated beauty salons, hair salons and spas near you.",
    keywords: [
      "get salons reviews",
      "salon reviews near me",
      "best rated salons Pakistan",
      "top salon reviews",
      "beauty salon ratings",
      "verified salon reviews",
    ],
    path: "/salon-reviews",
  });
}

const reviewCards = [
  { heading: "Explore reviews", title: "Top-rated salons", text: "Start with salons that have earned strong ratings from customers who booked through the platform.", href: "/top-salons" },
  { heading: "Explore reviews", title: "Reviews by city", text: "Open a city page to compare local salons, ratings, prices and services side by side.", href: "/salons" },
  { heading: "Explore reviews", title: "Salon profiles", text: "Read the complete review section, then check the service menu and booking availability.", href: "/salons" },
  { heading: "Explore reviews", title: "Beauty guides", text: "Learn what to ask and what to look for before choosing a salon or treatment.", href: "/blog" },
];

export default async function SalonReviewsPage() {
  const result = await searchSalonsApi(
    { sort: "reviews", rating: 1, limit: 8 },
    { revalidate: 300 }
  );

  return (
    <IntentLandingPage
      path="/salon-reviews"
      title="Get Salon Reviews You Can Use Before Booking"
      badge="Verified customer feedback"
      description="Read salon reviews, compare ratings and shortlist beauty professionals across Pakistan. Use real customer experiences alongside prices, services and location to choose with confidence."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Salon Reviews", path: "/salon-reviews" },
      ]}
      primaryCta={{ label: "See top-rated salons", href: "/top-salons" }}
      secondaryCta={{ label: "Find salons near me", href: "/salons-near-me" }}
      features={[
        {
          icon: ShieldCheck,
          title: "Verified booking feedback",
          text: "GetSalons reviews are tied to completed bookings so customers can make decisions using relevant experiences.",
        },
        {
          icon: Star,
          title: "Compare ratings and detail",
          text: "Look beyond a star score: read what customers say about service quality, staff, value and the overall visit.",
        },
        {
          icon: MessageCircle,
          title: "Review after your visit",
          text: "After a completed appointment, share an honest review to help the next customer choose a better salon.",
        },
      ]}
      salons={result.salons}
      salonsHeading="Salons with strong reviews"
      salonsDescription="Browse highly reviewed listings, then open each profile for the full customer feedback and service details."
      linkCards={reviewCards}
      sections={[
        {
          heading: "Get salon reviews before you choose",
          paragraphs: [
            <>
              Searching for salon reviews near you? Start with <Link href="/top-salons" className="font-medium text-gold hover:underline">top-rated salons</Link>, filter by city and open the listings that fit your service and budget. A useful review should help you understand the actual customer experience, not just show a number.
            </>,
            <>
              Read several recent reviews and look for details that matter to your appointment: punctuality, consultation, hygiene, staff professionalism, the quality of the result and whether the final price matched expectations. Then check the salon&apos;s <Link href="/salon-services" className="font-medium text-gold hover:underline">service menu</Link> before booking.
            </>,
          ],
        },
        {
          heading: "How to compare salon ratings fairly",
          paragraphs: [
            "A salon with hundreds of reviews gives you a different level of evidence from a new salon with only a few ratings. Consider both the average score and the number of reviews, and read comments that relate to the exact treatment you want.",
            <>
              Reviews work best when combined with transparent <Link href="/salon-prices" className="font-medium text-gold hover:underline">salon prices</Link>, service descriptions, location and photos. GetSalons gives you these details together so you can decide on value rather than rating alone.
            </>,
          ],
        },
      ]}
      faqs={[
        {
          question: "Are GetSalons salon reviews genuine?",
          answer: "GetSalons allows customers who completed a booking through the platform to rate and review their experience. Reviews are intended to reflect real appointments rather than anonymous claims.",
        },
        {
          question: "How do I find the best-reviewed salon near me?",
          answer: "Open Top Salons, select a city or search the salon catalog, then compare ratings, review counts, service details and prices for the salons that match your needs.",
        },
        {
          question: "Should I choose a salon with a five-star rating?",
          answer: "A high rating is useful, but also check the number and recency of reviews, the exact service being reviewed, the salon's price and whether its location and hours suit you.",
        },
        {
          question: "Can I leave a salon review after booking?",
          answer: "Customers can review a completed appointment through their GetSalons account. Honest, specific feedback helps other customers and gives salons a chance to improve.",
        },
      ]}
      relatedLinks={[
        { label: "Top salons", href: "/top-salons", description: "See highly rated salons across Pakistan." },
        { label: "Salons near me", href: "/salons-near-me", description: "Find reviewed salons in your city." },
        { label: "Salon prices", href: "/salon-prices", description: "Compare price information alongside reviews." },
        { label: "Salon services", href: "/salon-services", description: "Check whether a salon offers your treatment." },
        { label: "Salon offers", href: "/salon-offers-packages", description: "Find deals without ignoring quality signals." },
        { label: "Beauty blog", href: "/blog", description: "Read practical guides for choosing salons and services." },
      ]}
    />
  );
}
