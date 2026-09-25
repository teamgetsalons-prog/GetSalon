import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Percent, Tag } from "lucide-react";
import { getDealsApi, searchSalonsApi } from "@/lib/server-api";
import { IntentLandingPage } from "@/components/seo/intent-landing-page";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Salon Offers & Packages in Pakistan - Save on Beauty Services | GetSalons",
    description:
      "Find salon offers and beauty packages in Pakistan. Compare discounts on hair, facials, bridal makeup, nails and more, then book directly with GetSalons.",
    keywords: [
      "salon offers package",
      "salon offers and packages",
      "beauty salon packages",
      "salon deals Pakistan",
      "bridal makeup package",
      "salon discount offers",
    ],
    path: "/salon-offers-packages",
  });
}

const offerCards = [
  { heading: "Explore salon packages", title: "Hair offers", text: "Look for discounted cuts, styling, colour and treatment combinations.", href: "/services/hair" },
  { heading: "Explore salon packages", title: "Facial and skincare offers", text: "Compare facial, cleanup and skincare packages when salons run seasonal promotions.", href: "/services/facial" },
  { heading: "Explore salon packages", title: "Bridal beauty packages", text: "Explore bridal makeup and wedding beauty services, then confirm what each package includes.", href: "/services/bridal" },
  { heading: "Explore salon packages", title: "Nail and self-care deals", text: "Find manicure, pedicure, nail art, waxing and spa combinations at local salons.", href: "/services/nails" },
];

export default async function SalonOffersPackagesPage() {
  const [result, dealsResult] = await Promise.all([
    searchSalonsApi({ sort: "featured", limit: 8 }, { revalidate: 300 }),
    getDealsApi({ limit: 8 }, { revalidate: 300 }),
  ]);

  return (
    <IntentLandingPage
      path="/salon-offers-packages"
      title="Find Salon Offers and Beauty Packages That Fit Your Budget"
      badge="Deals and packages"
      description="Discover salon offers, discounted treatments and beauty packages across Pakistan. Compare the service, original price, deal terms and salon reviews before you book."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Salon Offers & Packages", path: "/salon-offers-packages" },
      ]}
      primaryCta={{ label: "See current offers", href: "/offers" }}
      secondaryCta={{ label: "Browse all salons", href: "/salons" }}
      features={[
        {
          icon: Percent,
          title: "Find real discounts",
          text: "Browse active salon deals and compare the deal price with the original service price when available.",
        },
        {
          icon: Tag,
          title: "Understand the package",
          text: "Check which treatments are included, the validity period, terms and any redemption limits before booking.",
        },
        {
          icon: CalendarCheck,
          title: "Book the package",
          text: "Open the salon profile, review its services and use the booking flow or contact details to confirm your slot.",
        },
      ]}
      salons={result.salons}
      salonsHeading="Salons to check for new offers"
      salonsDescription="Salons regularly add seasonal deals. Open a profile or visit the live offers page to see what is available now."
      offers={dealsResult.deals}
      offersHeading="Current salon offers and packages"
      offersDescription="These live deals include the discount, deal price and salon location so you can compare before booking."
      linkCards={offerCards}
      sections={[
        {
          heading: "How to find salon offers and packages",
          paragraphs: [
            <>
              Visit the <Link href="/offers" className="font-medium text-gold hover:underline">live offers page</Link> to see active discounts from participating salons. Offers can cover a single service, a bundle such as haircut plus styling, or a larger package for bridal, skincare, nails or self-care. Availability and expiry dates are set by the salon.
            </>,
            <>
              Before you book, compare the package with the salon&apos;s regular <Link href="/salon-prices" className="font-medium text-gold hover:underline">price list</Link>, read <Link href="/salon-reviews" className="font-medium text-gold hover:underline">customer reviews</Link> and check whether the treatment suits your needs. A discount is most useful when the inclusions, duration and terms are clear.
            </>,
          ],
        },
        {
          heading: "What to check in a salon package",
          paragraphs: [
            "Read the exact services included, whether the package is for one person, how long it remains valid and whether an appointment is required. Some packages may have limits on dates, staff, products, hair length or redemption numbers.",
            "For bridal and chemical treatments, ask the salon what products and preparation are included. For facials, nails and spa services, confirm the duration and any aftercare guidance. When in doubt, contact the salon before paying or arriving.",
          ],
        },
      ]}
      faqs={[
        {
          question: "Where can I find salon offers and packages?",
          answer: "Start with the GetSalons offers page for active deals. You can also browse service pages and salon profiles, where participating salons may show their own packages and promotions.",
        },
        {
          question: "What types of salon packages are available?",
          answer: "Packages can include hair services, facials, skincare, bridal makeup, nails, waxing, massage and combinations of treatments. The available packages depend on the salon and current promotion.",
        },
        {
          question: "How do I know what a salon offer includes?",
          answer: "Read the offer description, price, validity date and terms. If anything is unclear, contact the salon before booking so you understand the treatment and any restrictions.",
        },
        {
          question: "Can I compare an offer with regular salon prices?",
          answer: "Yes. Open the salon profile and review its service menu and prices, then compare the package inclusions and deal price with the regular options.",
        },
      ]}
      relatedLinks={[
        { label: "Live salon offers", href: "/offers", description: "See current discounts and limited-time deals." },
        { label: "Salon prices", href: "/salon-prices", description: "Compare regular service prices before choosing a deal." },
        { label: "Salon reviews", href: "/salon-reviews", description: "Check customer experiences alongside the discount." },
        { label: "Salon services", href: "/salon-services", description: "Browse packages by treatment category." },
        { label: "Salons near me", href: "/salons-near-me", description: "Find offers at convenient nearby locations." },
        { label: "Bridal services", href: "/services/bridal", description: "Explore bridal makeup and wedding beauty packages." },
      ]}
    />
  );
}
