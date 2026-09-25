import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Search, Star } from "lucide-react";
import { IntentLandingPage } from "@/components/seo/intent-landing-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Salon Booking App in Pakistan - Book Online | GetSalons",
  description:
    "Looking for free salon booking apps? GetSalons helps you find salons, compare prices, read verified reviews and book beauty appointments online at no customer booking fee.",
  keywords: [
    "salon booking apps free",
    "free salon booking app",
    "book salon appointment online free",
    "salon booking app Pakistan",
    "online beauty appointment booking",
  ],
  path: "/free-salon-booking-app",
});

const appCards = [
  { heading: "Use GetSalons", title: "Find a salon", text: "Search by city, service, salon name, price range and rating from one mobile-friendly catalog.", href: "/salons" },
  { heading: "Use GetSalons", title: "Book an appointment", text: "Choose a listed service and available time slot without paying GetSalons a booking fee.", href: "/salons-near-me" },
  { heading: "Use GetSalons", title: "Compare before you commit", text: "Review salon profiles, prices, photos, opening hours and verified customer feedback.", href: "/salon-reviews" },
  { heading: "Use GetSalons", title: "Install on your phone", text: "Use the web app on mobile and add it to your home screen where your browser supports installation.", href: "/register" },
];

export default function FreeSalonBookingAppPage() {
  return (
    <IntentLandingPage
      path="/free-salon-booking-app"
      title="A Free Salon Booking App for Finding and Booking Beauty Services"
      badge="Simple online booking"
      description="Looking for salon booking apps that are free? GetSalons gives customers a mobile-friendly way to discover salons in Pakistan, compare services and prices, read reviews and book appointments online."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Free Salon Booking App", path: "/free-salon-booking-app" },
      ]}
      primaryCta={{ label: "Find a salon", href: "/salons" }}
      secondaryCta={{ label: "Create a free account", href: "/register" }}
      features={[
        {
          icon: Search,
          title: "Discover nearby options",
          text: "Search salons, barbers and spas by city or service instead of calling around to find availability.",
        },
        {
          icon: CalendarCheck,
          title: "Book without a customer fee",
          text: "Searching and booking through GetSalons is free for customers. You pay the salon for the service you receive.",
        },
        {
          icon: Star,
          title: "Choose with confidence",
          text: "Compare ratings, verified reviews, service menus, price ranges, photos and opening hours in one place.",
        },
      ]}
      linkCards={appCards}
      sections={[
        {
          heading: "How this free salon booking app works",
          paragraphs: [
            <>
              GetSalons is built for customers who want a simpler way to book beauty appointments. Search for a salon or service, choose your city, compare profiles and select a suitable appointment time. Start from <Link href="/salons-near-me" className="font-medium text-gold hover:underline">salons near me</Link> or browse the full <Link href="/salon-services" className="font-medium text-gold hover:underline">salon service directory</Link>.
            </>,
            "There is no customer booking fee. A free account helps keep your confirmations, upcoming appointments and booking history together, while the salon remains responsible for the service price and its cancellation policy.",
          ],
        },
        {
          heading: "Why use an online salon booking app?",
          paragraphs: [
            "Online booking makes it easier to compare options outside business hours, see whether a salon offers the treatment you need and avoid waiting on a phone call. You can also use verified customer feedback and price information to narrow the list before making a decision.",
            <>
              Whether you need a haircut, facial, manicure, bridal makeup or massage, GetSalons connects discovery with booking. You can also check <Link href="/salon-offers-packages" className="font-medium text-gold hover:underline">salon offers and packages</Link> before choosing your appointment.
            </>,
          ],
        },
        {
          heading: "Is GetSalons a native mobile app?",
          paragraphs: [
            "GetSalons works in a mobile browser and is designed to be quick and easy to use on a phone. On supported browsers, you can add the site to your home screen for an app-like shortcut. No paid app download is required to search or book.",
          ],
        },
      ]}
      faqs={[
        {
          question: "Is GetSalons free for customers?",
          answer: "Yes. Customers can discover salons and book appointments through GetSalons without paying a platform booking fee. The salon charges for the service you receive.",
        },
        {
          question: "Do I need an account to book a salon?",
          answer: "You need a free customer account to complete a booking. This lets GetSalons send confirmations and keep your appointment history organized.",
        },
        {
          question: "Can I use GetSalons on my phone?",
          answer: "Yes. GetSalons is mobile-friendly and works in modern phone browsers. You may also add it to your home screen where your browser supports web-app installation.",
        },
        {
          question: "Can salon owners use GetSalons too?",
          answer: "Yes. Salon owners can list their business, add services and manage bookings through the partner tools. Start at the free salon booking system page to learn more.",
        },
      ]}
      relatedLinks={[
        { label: "Find salons near me", href: "/salons-near-me", description: "Search nearby salons and book a convenient slot." },
        { label: "Compare salon prices", href: "/salon-prices", description: "See pricing information before you make an appointment." },
        { label: "Read salon reviews", href: "/salon-reviews", description: "Use verified customer feedback to shortlist salons." },
        { label: "Browse salon services", href: "/salon-services", description: "Start with the exact treatment you need." },
        { label: "Best free booking system", href: "/best-free-salon-booking-system", description: "Tools and booking options for salon owners." },
        { label: "Salon deals and packages", href: "/salon-offers-packages", description: "Find offers before confirming your booking." },
      ]}
    />
  );
}
