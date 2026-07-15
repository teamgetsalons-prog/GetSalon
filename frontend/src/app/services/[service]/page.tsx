import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { Scissors, Star, Clock, CheckCircle } from "lucide-react";
import { searchSalonsApi } from "@/lib/server-api";
import { SalonCard } from "@/components/salons/salon-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";

// See salons/[city]/page.tsx for why this replaces force-dynamic.
export const revalidate = 300;

// Major cities this national page links down into - mirrors the city list
// already used for cross-linking on the sibling [city]/[service] page.
const TOP_CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"];

type Params = { params: Promise<{ service: string }> };

const serviceDescriptions: Record<string, { title: string; description: string }> = {
  hair: {
    title: "Hair Services",
    description: "Haircuts, styling, coloring, treatments and more from top-rated salons",
  },
  makeup: {
    title: "Makeup Services",
    description: "Professional makeup for parties, events, photoshoots and everyday glam",
  },
  facial: {
    title: "Facial Services",
    description: "Deep cleansing, whitening, anti-aging and hydrating facials",
  },
  nails: {
    title: "Nail Services",
    description: "Manicure, pedicure, nail art, gel nails and extensions",
  },
  bridal: {
    title: "Bridal Services",
    description: "Complete bridal packages including makeup, hair, mehndi and more",
  },
  massage: {
    title: "Massage Services",
    description: "Relaxing massage, deep tissue, hot stone and aromatherapy",
  },
  "skin-care": {
    title: "Skin Care Services",
    description: "Chemical peels, microdermabrasion, acne treatment and skin brightening",
  },
  waxing: {
    title: "Waxing Services",
    description: "Full body waxing, eyebrow shaping and hair removal services",
  },
};

/** Shared between generateMetadata and the page body - one fetch, not two. */
const loadServicePage = cache(async (service: string, serviceName: string) => {
  let result = await searchSalonsApi({ category: service, limit: 50 }, { revalidate: 300 });
  if (result.salons.length === 0) {
    result = await searchSalonsApi({ q: serviceName, limit: 50 }, { revalidate: 300 });
  }
  return result;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { service } = await params;
  const serviceName = serviceDescriptions[service]?.title || service.replace(/-/g, " ");
  const description =
    serviceDescriptions[service]?.description ||
    `Find and book the best ${serviceName} salons on GetSalons`;
  const result = await loadServicePage(service, serviceName);

  return buildMetadata({
    title: `Best ${serviceName} Salons — Book Online | ${SITE.shortName}`,
    description: `${description}. Compare prices, read verified reviews and book appointments online for free.`,
    path: `/services/${service}`,
    index: result.salons.length > 0,
  });
}

export default async function ServiceSalonsPage({ params }: Params) {
  const { service } = await params;
  const serviceName =
    serviceDescriptions[service]?.title ||
    service.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const result = await loadServicePage(service, serviceName);

  const faqs = [
    {
      question: `How do I find ${serviceName.toLowerCase()} salons?`,
      answer: `Browse all verified ${serviceName.toLowerCase()} salons on this page. Use filters to narrow down by city, price range, rating or gender preference.`,
    },
    {
      question: `How much do ${serviceName.toLowerCase()} services cost?`,
      answer: `Prices vary by salon and service. You can compare prices from different salons on this page to find one that fits your budget.`,
    },
    {
      question: `Can I book ${serviceName.toLowerCase()} appointments online?`,
      answer: "Yes! Simply choose a salon, select your preferred service and time slot, and receive instant confirmation through GetSalons.",
    },
    {
      question: `Are the reviews genuine?`,
      answer: "Every review on GetSalons is from a verified customer who completed a booking through our platform. We do not allow fake reviews.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/salons" },
            { name: serviceName, path: `/services/${service}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Best ${serviceName} Salons`,
            description: `Find and book the best ${serviceName} salons on GetSalons`,
            url: `${SITE.url}/services/${service}`,
          },
          faqJsonLd(faqs),
        ]}
      />

      {/* Hero Section */}
      <div className="mb-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-fg-faint">
          <Link href="/" className="hover:text-gold">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/salons" className="hover:text-gold">Services</Link>
          <span className="mx-1.5">/</span>
          <span className="text-fg-muted">{serviceName}</span>
        </nav>

        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Best {serviceName} Salons
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-fg-muted">
          {serviceDescriptions[service]?.description ||
            `Find and book the best ${serviceName.toLowerCase()} services from verified salons across Pakistan.`}
        </p>

        {/* Quick Stats */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <Scissors className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-fg">{result.total} Salons</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <Star className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-fg">Verified Reviews</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <Clock className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-fg">24/7 Booking</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <CheckCircle className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-fg">Free for Customers</span>
          </div>
        </div>
      </div>

      {/* Salon Grid */}
      {result.salons.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-12 text-center">
          <Scissors className="mx-auto h-12 w-12 text-fg-faint" />
          <h2 className="mt-4 text-lg font-semibold">
            No {serviceName.toLowerCase()} salons found
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            Try browsing all salons or explore other service categories.
          </p>
          <Link
            href="/salons"
            className="mt-6 inline-flex rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
          >
            Browse All Salons
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {result.salons.map((salon) => (
            <SalonCard key={salon._id} salon={salon} />
          ))}
        </div>
      )}

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">
          Frequently Asked Questions about {serviceName}
        </h2>
        <div className="mt-6 space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-line bg-card"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-sm font-medium text-fg">
                {faq.question}
                <span className="text-fg-faint group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-sm leading-relaxed text-fg-muted">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Browse by city */}
      <section className="mt-16 rounded-2xl border border-line bg-card p-8">
        <h2 className="text-lg font-semibold">{serviceName} by City</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOP_CITIES.map((c) => (
            <Link
              key={c}
              href={`/salons/${c.toLowerCase()}/${service}`}
              className="rounded-full border border-line px-4 py-2 text-sm text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
            >
              {serviceName} in {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Related Services */}
      <section className="mt-8 rounded-2xl border border-line bg-card p-8">
        <h2 className="text-lg font-semibold">Explore Other Services</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(serviceDescriptions)
            .filter((s) => s !== service)
            .map((s) => (
              <Link
                key={s}
                href={`/services/${s}`}
                className="rounded-full border border-line px-4 py-2 text-sm text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
              >
                {serviceDescriptions[s]?.title || s}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
