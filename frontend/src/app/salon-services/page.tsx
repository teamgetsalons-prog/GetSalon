import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Scissors, Star } from "lucide-react";
import { IntentLandingPage } from "@/components/seo/intent-landing-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Salon Services in Pakistan - Hair, Beauty, Nails & Spa | GetSalons",
  description:
    "Explore salon services in Pakistan, from haircuts and colour to facials, bridal makeup, nails, waxing and massage. Compare salons, prices and reviews online.",
  keywords: [
    "get salons services",
    "salon services near me",
    "beauty salon services",
    "hair salon services",
    "salon service price list",
    "beauty services Pakistan",
  ],
  path: "/salon-services",
});

const serviceCards = [
  { heading: "Browse salon services", title: "Hair services", text: "Haircuts, styling, colour, highlights, keratin and treatments from local salons.", href: "/services/hair" },
  { heading: "Browse salon services", title: "Makeup services", text: "Party makeup, event glam and professional makeup artists for every occasion.", href: "/services/makeup" },
  { heading: "Browse salon services", title: "Facials and skincare", text: "Compare cleansing, hydrating, brightening and advanced facial treatments.", href: "/services/facial" },
  { heading: "Browse salon services", title: "Nails", text: "Find manicures, pedicures, nail art, gel nails and nail extensions.", href: "/services/nails" },
  { heading: "Browse salon services", title: "Bridal beauty", text: "Discover bridal makeup, hair styling and complete wedding beauty packages.", href: "/services/bridal" },
  { heading: "Browse salon services", title: "Massage and spa", text: "Book relaxing massage, deep tissue, hot stone and spa treatments.", href: "/services/massage" },
  { heading: "Browse salon services", title: "Waxing", text: "Find salons offering waxing, threading and other hair-removal services.", href: "/services/waxing" },
  { heading: "Browse salon services", title: "Skin care", text: "Explore chemical peels, acne care and skin-brightening services.", href: "/services/skin-care" },
];

export default function SalonServicesPage() {
  return (
    <IntentLandingPage
      path="/salon-services"
      title="Explore Salon Services, Treatments and Beauty Experiences"
      badge="Salon service directory"
      description="Get salon services that match your look, occasion and budget. Browse popular treatments across Pakistan, compare salons and see what each service costs before you book."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Salon Services", path: "/salon-services" },
      ]}
      primaryCta={{ label: "Find a salon", href: "/salons" }}
      secondaryCta={{ label: "Compare prices", href: "/salon-prices" }}
      features={[
        {
          icon: Scissors,
          title: "Search by treatment",
          text: "Find the exact service you need, from a simple haircut to bridal makeup or a full spa treatment.",
        },
        {
          icon: Star,
          title: "Compare trusted salons",
          text: "Use ratings, verified reviews, photos and service details to make a more confident choice.",
        },
        {
          icon: CalendarCheck,
          title: "Book the right slot",
          text: "Choose a salon, service and available time online instead of calling multiple businesses.",
        },
      ]}
      linkCards={serviceCards}
      sections={[
        {
          heading: "Get salon services for every beauty need",
          paragraphs: [
            <>
              GetSalons helps you discover beauty services in one place. Search by service, city or salon name to find hair salons, beauty parlours, barbers and spas across Pakistan. Every profile can include a service menu, starting prices, photos, opening hours and booking details.
            </>,
            <>
              Whether you need a quick <Link href="/services/hair" className="font-medium text-gold hover:underline">haircut or hair treatment</Link>, a <Link href="/services/facial" className="font-medium text-gold hover:underline">facial</Link>, <Link href="/services/nails" className="font-medium text-gold hover:underline">manicure and pedicure</Link>, or <Link href="/services/bridal" className="font-medium text-gold hover:underline">bridal makeup</Link>, you can compare suitable salons before making an appointment.
            </>,
          ],
        },
        {
          heading: "How to choose a salon service",
          paragraphs: [
            "Start by deciding what result you want and how much time you have. Then check the service description, duration, listed price and salon reviews. For colour, chemical treatments and bridal work, review the salon gallery and ask about a consultation or trial when appropriate.",
            <>
              Prices can vary by city, product, hair length, treatment complexity and specialist experience. Use the <Link href="/salon-prices" className="font-medium text-gold hover:underline">salon prices guide</Link> to compare what is included, then open the salon profile for the most accurate current menu.
            </>,
          ],
        },
      ]}
      faqs={[
        {
          question: "What salon services can I find on GetSalons?",
          answer: "You can find haircuts, styling, hair colour, keratin, makeup, bridal beauty, facials, skincare, nails, waxing, threading, massage, spa treatments and men's grooming, depending on the salons in your city.",
        },
        {
          question: "How do I find a salon service near me?",
          answer: "Choose a service directory above or search the salon catalog by service and city. You can then filter results and open profiles to compare services, prices and reviews.",
        },
        {
          question: "Can I see salon services and prices before booking?",
          answer: "Yes. Participating salons list their services and prices on their profiles. Always check the current salon menu for the final price and any terms that apply.",
        },
        {
          question: "Are all salon services available in every city?",
          answer: "Availability depends on the salons currently listed in each city. Use the city and service pages to see the options available near you.",
        },
      ]}
      relatedLinks={[
        { label: "Salons near me", href: "/salons-near-me", description: "Search local salons by city, service, price and rating." },
        { label: "Salon prices", href: "/salon-prices", description: "Learn what to compare before choosing a treatment." },
        { label: "Salon reviews", href: "/salon-reviews", description: "Find highly rated salons based on customer feedback." },
        { label: "Salon offers and packages", href: "/salon-offers-packages", description: "Look for discounts and bundled beauty treatments." },
        { label: "Hair salons in Lahore", href: "/salons/lahore/hair", description: "Browse hair salons and services in Lahore." },
        { label: "Top salons in Pakistan", href: "/top-salons", description: "See the highest-rated salons on GetSalons." },
      ]}
    />
  );
}
