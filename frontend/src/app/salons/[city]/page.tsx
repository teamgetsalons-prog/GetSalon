import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MapPin, Star, Clock, CheckCircle } from "lucide-react";
import { getCategoriesApi, getCitiesApi, getCityBySlug, searchSalonsApi } from "@/lib/server-api";
import { SalonCard } from "@/components/salons/salon-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";

// Data-cache revalidation replaces force-dynamic (see serverFetch's `revalidate`
// option) - the expensive salon/city/category lookups below are reused across
// requests instead of hitting the backend every time. This page must NOT sit
// under a route segment with its own loading.tsx (the sibling `(list)` group
// holds /salons' loading.tsx) - a loading.tsx ancestor wraps the page in a
// Suspense boundary, which streams a 200 status before notFound() can run and
// permanently locks it, so this page returns 200 with 404 content instead of
// a real 404. See salons/(list)/loading.tsx.
export const revalidate = 300;

type Params = { params: Promise<{ city: string }> };

/** Shared between generateMetadata and the page body so both use one fetch,
 * not two, for the same request. */
const loadCityPage = cache(async (city: string) => {
  const [cityRecord, result, catDocs, otherCities] = await Promise.all([
    getCityBySlug(city, { revalidate: 300 }),
    searchSalonsApi({ city, limit: 50 }, { revalidate: 300 }),
    getCategoriesApi(false, { revalidate: 300 }),
    getCitiesApi(false, true, { revalidate: 300 }),
  ]);
  return { cityRecord, result, categories: catDocs, otherCities };
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city } = await params;
  const { cityRecord, result } = await loadCityPage(city);
  if (!cityRecord) return { title: "City not found" };
  const cityName = cityRecord.name;

  return buildMetadata({
    title: `Best Salons in ${cityName} — Book Online | ${SITE.shortName}`,
    description: `Discover and book the best salons, beauty parlours and spas in ${cityName}. Compare prices, read verified reviews and book appointments online for free.`,
    path: `/salons/${city}`,
    // No salons yet for a real city is a temporary state, not a dead page -
    // keep it out of the index until it has something to show, but let
    // crawlers keep following its links (category chips, other-cities list).
    index: result.salons.length > 0,
  });
}

export default async function CitySalonsPage({ params }: Params) {
  const { city } = await params;
  const { cityRecord, result, categories: catDocs, otherCities } = await loadCityPage(city);
  if (!cityRecord) notFound();
  const cityName = cityRecord.name;
  const categories = catDocs.map((c) => ({ name: c.name, slug: c.slug }));

  const faqs = [
    {
      question: `How do I find salons in ${cityName}?`,
      answer: `You can browse all verified salons in ${cityName} on this page. Use filters to narrow down by service, rating, price range, or gender preference.`,
    },
    {
      question: `Are salon reviews on GetSalons genuine?`,
      answer: "Every review on GetSalons is from a verified customer who completed a booking through our platform. We do not allow fake or incentivized reviews.",
    },
    {
      question: `Can I book salon appointments online in ${cityName}?`,
      answer: `Yes! You can book appointments 24/7 through GetSalons. Simply choose a salon, select your service and preferred time slot, and receive instant confirmation.`,
    },
    {
      question: `Do salons in ${cityName} offer home service?`,
      answer: "Many salons listed on GetSalons offer home service. Use the 'Home Service' filter while searching to find beauticians who come to your location.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Salons", path: "/salons" },
            { name: cityName, path: `/salons/${city}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Best Salons in ${cityName}`,
            description: `Discover and book the best salons in ${cityName} on GetSalons`,
            url: `${SITE.url}/salons/${city}`,
          },
          faqJsonLd(faqs),
        ]}
      />

      {/* Hero Section */}
      <div className="mb-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-fg-faint">
          <Link href="/" className="hover:text-gold">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/salons" className="hover:text-gold">Salons</Link>
          <span className="mx-1.5">/</span>
          <span className="text-fg-muted">{cityName}</span>
        </nav>

        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Best Salons in {cityName}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-fg-muted">
          Discover {result.total} verified salons and beauty parlours in {cityName}.
          Compare prices, read genuine reviews and book appointments online.
        </p>

        {/* Quick Stats */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <MapPin className="h-4 w-4 text-gold" />
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

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/salons/${city}?category=${cat.slug}`}
                className="rounded-full border border-line bg-card px-4 py-2 text-sm text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Salon Grid */}
      {result.salons.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-fg-faint" />
          <h2 className="mt-4 text-lg font-semibold">No salons found in {cityName}</h2>
          <p className="mt-2 text-sm text-fg-muted">
            We&apos;re expanding to {cityName} soon. Check back later or explore salons in other cities.
          </p>
          <Link
            href="/salons"
            className="mt-6 inline-flex rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
          >
            Browse All Salons
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.salons.map((salon) => (
            <SalonCard key={salon._id} salon={salon} />
          ))}
        </div>
      )}

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">
          Frequently Asked Questions about Salons in {cityName}
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

      {/* Internal Links - only cities that currently have live salons, so
          this never sends customers to another dead-end "0 salons" page. */}
      {otherCities.filter((c) => c.slug !== city).length > 0 && (
        <section className="mt-16 rounded-2xl border border-line bg-card p-8">
          <h2 className="text-lg font-semibold">Explore Salons in Other Cities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherCities
              .filter((c) => c.slug !== city)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/salons/${c.slug}`}
                  className="rounded-full border border-line px-4 py-2 text-sm text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
                >
                  Salons in {c.name}
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
