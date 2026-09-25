import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CalendarCheck, Users } from "lucide-react";
import { IntentLandingPage } from "@/components/seo/intent-landing-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Best Free Salon Booking System for Pakistan | GetSalons",
  description:
    "Looking for the best free salon booking system? GetSalons helps Pakistani salons get discovered, manage online appointments, services, staff and reviews with no upfront listing cost.",
  keywords: [
    "best free salon booking system",
    "free salon booking software",
    "salon appointment booking system free",
    "salon management system Pakistan",
    "online booking for salons",
  ],
  path: "/best-free-salon-booking-system",
});

const ownerCards = [
  { heading: "Grow with GetSalons", title: "List your salon", text: "Create a public profile so customers can discover your services, location, hours and photos.", href: "/partner" },
  { heading: "Grow with GetSalons", title: "Accept online bookings", text: "Let customers request available appointment slots while you manage your schedule in one place.", href: "/partner/register" },
  { heading: "Grow with GetSalons", title: "Build review trust", text: "Collect feedback from completed appointments and use your reputation to stand out locally.", href: "/salon-reviews" },
  { heading: "Grow with GetSalons", title: "Promote offers", text: "Share salon deals and service packages to help fill quieter slots and attract new customers.", href: "/salon-offers-packages" },
];

export default function BestFreeSalonBookingSystemPage() {
  return (
    <IntentLandingPage
      path="/best-free-salon-booking-system"
      title="The Best Free Salon Booking System for Growing in Pakistan"
      badge="For salon owners and beauty businesses"
      description="GetSalons gives salons a free-to-start way to get discovered, showcase services, accept online bookings and build a trusted reputation. Replace missed calls and manual appointment notes with one clear profile and dashboard."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Free Salon Booking System", path: "/best-free-salon-booking-system" },
      ]}
      primaryCta={{ label: "List your salon for free", href: "/partner/register" }}
      secondaryCta={{ label: "See how it works", href: "/partner" }}
      features={[
        {
          icon: CalendarCheck,
          title: "Online appointments",
          text: "Give customers a simple way to request and manage appointments instead of relying only on calls and walk-ins.",
        },
        {
          icon: Users,
          title: "More local discovery",
          text: "Show up when customers search by city, service, price and rating on a Pakistan-focused salon marketplace.",
        },
        {
          icon: BarChart3,
          title: "Tools that support growth",
          text: "Manage services, staff, salon details, reviews, deals and booking activity from your business tools.",
        },
      ]}
      linkCards={ownerCards}
      sections={[
        {
          heading: "What makes a free salon booking system useful?",
          paragraphs: [
            "A booking system should do more than put a calendar on your website. It should help customers discover your business, understand your services and prices, choose a time and arrive with the right expectations. For the salon team, it should reduce double bookings and make daily appointment information easier to manage.",
            <>
              GetSalons combines a public salon profile with online discovery, service menus, staff and schedule tools, customer reviews and salon offers. The <Link href="/partner" className="font-medium text-gold hover:underline">partner page</Link> explains how a salon can get started and appear in searches across Pakistan.
            </>,
          ],
        },
        {
          heading: "Why GetSalons is a strong free-to-start option",
          paragraphs: [
            "GetSalons is built around the needs of local beauty businesses: salons can show their location and opening hours, add services and prices, present their work with photos, manage team information and receive bookings from customers who are already searching for beauty services.",
            "The free-to-start model helps a salon test online bookings and digital discovery without committing to a large software rollout first. As your profile gets more complete, customers have more information to use when comparing you with other salons in the area.",
          ],
        },
        {
          heading: "How to start accepting salon bookings",
          paragraphs: [
            <>
              Create a business account, submit your salon details and add your services, team, hours, location and photos. After the profile is reviewed, customers can discover your listing and use the available booking flow. Begin with <Link href="/partner/register" className="font-medium text-gold hover:underline">free salon registration</Link> or contact the GetSalons team if you need help setting up your profile.
            </>,
          ],
        },
      ]}
      faqs={[
        {
          question: "Is GetSalons a free salon booking system?",
          answer: "GetSalons is free to start for salon businesses. You can create a listing and use the platform to get discovered and receive bookings; review the current partner terms during registration for any optional features or conditions.",
        },
        {
          question: "What can a salon manage on GetSalons?",
          answer: "Salon partners can manage their public profile, services, staff, opening hours, gallery, deals, bookings and customer reviews through the available business tools.",
        },
        {
          question: "Is this salon booking software suitable for small salons?",
          answer: "Yes. A public listing and online booking flow can help small salons, independent beauticians and growing teams get discovered without needing to build a complete booking website first.",
        },
        {
          question: "How do I register my salon?",
          answer: "Open the partner registration page, create an owner account and submit your salon information. The GetSalons team reviews new listings before they go live.",
        },
      ]}
      relatedLinks={[
        { label: "List your salon", href: "/partner", description: "See the benefits of joining GetSalons as a partner." },
        { label: "Free registration", href: "/partner/register", description: "Create a salon business account and submit your profile." },
        { label: "Customer salon app", href: "/free-salon-booking-app", description: "See how customers discover and book salons online." },
        { label: "Salon offers and packages", href: "/salon-offers-packages", description: "Use promotions to attract customers and fill availability." },
        { label: "Salon reviews", href: "/salon-reviews", description: "Learn how customer feedback supports trust and discovery." },
        { label: "About GetSalons", href: "/about", description: "Learn why the platform was built for Pakistan's beauty industry." },
      ]}
    />
  );
}
