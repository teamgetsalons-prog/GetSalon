import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star, Tag } from "lucide-react";
import { searchSalonsApi } from "@/lib/server-api";
import { IntentLandingPage } from "@/components/seo/intent-landing-page";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Fresha Hair Salon Near Me? Compare Local Options | GetSalons",
    description:
      "Searching for a Fresha hair salon near me? Compare independent hair salons in Pakistan by location, services, prices and verified reviews with GetSalons.",
    keywords: [
      "fresha hair salon near me",
      "fresha alternative Pakistan",
      "hair salon near me",
      "haircut price Pakistan",
      "book hair salon online",
    ],
    path: "/fresha-hair-salon-near-me",
  });
}

const hairCards = [
  { heading: "Compare hair salons", title: "Hair salons nationwide", text: "Browse hair salons offering cuts, styling, colour and treatments across Pakistan.", href: "/services/hair" },
  { heading: "Compare hair salons", title: "Hair salons near me", text: "Choose your city and find a convenient salon with the service and price you need.", href: "/salons-near-me" },
  { heading: "Compare hair salons", title: "Hair prices", text: "Check salon price ranges and open profiles for current hair service menus.", href: "/salon-prices" },
  { heading: "Compare hair salons", title: "Hair salon reviews", text: "Read customer feedback and compare ratings before booking a haircut or treatment.", href: "/salon-reviews" },
];

export default async function FreshaHairSalonNearMePage() {
  const result = await searchSalonsApi({ category: "hair", sort: "rating", limit: 8 }, { revalidate: 300 });

  return (
    <IntentLandingPage
      path="/fresha-hair-salon-near-me"
      title="Searching for a Fresha Hair Salon Near Me? Compare Local Salons"
      badge="Hair salon search"
      description="If you searched for a Fresha hair salon near me, you are probably looking for a nearby hairdresser with clear prices, good reviews and an easy way to book. Compare Pakistan-based options on GetSalons."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Hair Salons Near Me", path: "/fresha-hair-salon-near-me" },
      ]}
      primaryCta={{ label: "Find a hair salon", href: "/services/hair" }}
      secondaryCta={{ label: "Search by city", href: "/salons-near-me" }}
      features={[
        {
          icon: MapPin,
          title: "Find a convenient location",
          text: "Search hair salons by city and open profiles with addresses, areas, hours and directions.",
        },
        {
          icon: Tag,
          title: "Compare hair service prices",
          text: "Review listed price ranges and service menus before choosing a haircut, colour or treatment.",
        },
        {
          icon: Star,
          title: "Read reviews first",
          text: "Use verified customer feedback, ratings and salon photos to make a more informed shortlist.",
        },
      ]}
      salons={result.salons}
      salonsHeading="Hair salons to compare"
      salonsDescription="These hair-focused listings are a starting point. Open a profile to check services, prices and availability."
      linkCards={hairCards}
      sections={[
        {
          heading: "A clear alternative when searching for a hair salon",
          paragraphs: [
            <>
              The phrase &quot;Fresha hair salon near me&quot; often means you want a simple salon marketplace: nearby options, a visible service menu, customer reviews and an online booking path. GetSalons is an independent Pakistan-focused salon discovery and booking platform. It is not affiliated with Fresha, but it can help you compare local hair salons in the same practical way.
            </>,
            <>
              Start with the <Link href="/services/hair" className="font-medium text-gold hover:underline">hair salon directory</Link>, choose a city and compare the listings that offer the cut, styling, colour or treatment you want. You can also use the <Link href="/salon-prices" className="font-medium text-gold hover:underline">salon price guide</Link> and <Link href="/salon-reviews" className="font-medium text-gold hover:underline">review directory</Link> before booking.
            </>,
          ],
        },
        {
          heading: "What to check before booking a hair salon",
          paragraphs: [
            "For a haircut, check whether the stylist or salon regularly provides the look you want. For colour, keratin, rebonding and other chemical treatments, look at the service description, product details, before-and-after work and consultation options. A clear price range is helpful, but the exact quote may depend on hair length and treatment complexity.",
            <>
              Read several reviews that mention the specific service, confirm the salon address and check the available time before you book. If you are looking for a discount, browse current <Link href="/salon-offers-packages" className="font-medium text-gold hover:underline">salon offers and packages</Link> as well.
            </>,
          ],
        },
      ]}
      faqs={[
        {
          question: "Is GetSalons affiliated with Fresha?",
          answer: "No. GetSalons is an independent salon discovery and booking platform for Pakistan. This page helps people searching for a nearby hair salon compare local options without implying an affiliation with Fresha.",
        },
        {
          question: "How do I find a hair salon near me?",
          answer: "Open the hair service directory or search by city on GetSalons. Compare the salon address, services, price information, ratings and available appointment times.",
        },
        {
          question: "Can I compare haircut and hair treatment prices?",
          answer: "Yes. Hair salon profiles can include starting prices and individual services. Open the profile and confirm the final quote with the salon when the price depends on hair length or treatment complexity.",
        },
        {
          question: "Can I book a hair appointment online?",
          answer: "Yes. Choose a salon, select its hair service and pick an available time slot when online booking is enabled for that salon.",
        },
      ]}
      relatedLinks={[
        { label: "Hair services", href: "/services/hair", description: "Browse cuts, styling, colour and treatment salons." },
        { label: "Salons near me", href: "/salons-near-me", description: "Search local beauty businesses by city and service." },
        { label: "Hair salon prices", href: "/salon-prices", description: "Compare price ranges before you choose." },
        { label: "Salon reviews", href: "/salon-reviews", description: "Read customer feedback and ratings." },
        { label: "Top salons", href: "/top-salons", description: "Start with highly rated salons in Pakistan." },
        { label: "Salon offers", href: "/salon-offers-packages", description: "Check for hair deals and bundled packages." },
      ]}
    />
  );
}
