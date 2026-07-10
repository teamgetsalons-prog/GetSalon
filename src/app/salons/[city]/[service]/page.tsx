import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star, Clock, CheckCircle, Scissors } from "lucide-react";
import { connectDB } from "@/server/db";
import { City, Category } from "@/server/models";
import { searchSalons } from "@/server/services/salon.service";
import { searchSalonsSchema } from "@/lib/validations/salon";
import { SalonCard } from "@/components/salons/salon-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ city: string; service: string }> };

function formatService(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city, service } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const serviceName = formatService(service);

  return buildMetadata({
    title: `Best ${serviceName} in ${cityName} — Book Online | ${SITE.shortName}`,
    description: `Find and book the best ${serviceName.toLowerCase()} services in ${cityName}. Compare prices, read verified reviews and book appointments online for free.`,
    path: `/salons/${city}/${service}`,
  });
}

export default async function CityServiceSalonsPage({ params }: Params) {
  const { city, service } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const serviceName = formatService(service);

  const input = searchSalonsSchema.parse({ city, service });

  let result = { salons: [], total: 0, page: 1, totalPages: 0 } as Awaited<
    ReturnType<typeof searchSalons>
  >;

  try {
    await connectDB();
    result = await searchSalons(input);
  } catch {
    // DB unavailable
  }

  const faqs = [
    {
      question: `Where can I find the best ${serviceName.toLowerCase()} in ${cityName}?`,
      answer: `GetSalons lists all verified salons offering ${serviceName.toLowerCase()} in ${cityName}. Browse the results above to compare ratings, prices and reviews.`,
    },
    {
      question: `How much does ${serviceName.toLowerCase()} cost in ${cityName}?`,
      answer: `Prices vary by salon. On GetSalons, you can see the exact price for ${serviceName.toLowerCase()} at each salon before booking. Use the price filter to find options within your budget.`,
    },
    {
      question: `Can I book ${serviceName.toLowerCase()} online in ${cityName}?`,
      answer: `Yes! Simply click on any salon above, select the ${serviceName.toLowerCase()} service, choose your preferred date and time, and confirm your booking instantly.`,
    },
    {
      question: `Are the ${serviceName.toLowerCase()} salons in ${cityName} verified?`,
      answer: "All salons on GetSalons go through a verification process. Customer reviews are from real bookings, so you can trust the quality of service.",
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
            { name: serviceName, path: `/salons/${city}/${service}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Best ${serviceName} in ${cityName}`,
            description: `Find and book the best ${serviceName.toLowerCase()} services in ${cityName} on GetSalons`,
            url: `${SITE.url}/salons/${city}/${service}`,
          },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/salons" className="hover:text-gold">Salons</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/salons/${city}`} className="hover:text-gold">{cityName}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">{serviceName}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Best {serviceName} in {cityName}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-fg-muted">
          Discover {result.total} verified salons offering {serviceName.toLowerCase()} in {cityName}.
          Compare prices, read genuine reviews and book appointments online.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <Scissors className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-fg">{serviceName}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <MapPin className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-fg">{cityName}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <Star className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-fg">{result.total} Salons</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2">
            <CheckCircle className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-fg">Free Booking</span>
          </div>
        </div>
      </div>

      {/* Salon Grid */}
      {result.salons.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-12 text-center">
          <Scissors className="mx-auto h-12 w-12 text-fg-faint" />
          <h2 className="mt-4 text-lg font-semibold">
            No {serviceName.toLowerCase()} salons found in {cityName}
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            Try browsing all salons in {cityName} or check back later.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={`/salons/${city}`}
              className="inline-flex rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
            >
              All Salons in {cityName}
            </Link>
            <Link
              href="/salons"
              className="inline-flex rounded-xl border border-line px-6 py-2.5 text-sm font-semibold text-fg hover:border-gold-500/50 hover:text-gold"
            >
              Browse All Cities
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.salons.map((salon) => (
            <SalonCard key={salon._id} salon={salon} />
          ))}
        </div>
      )}

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">
          {serviceName} in {cityName} — Frequently Asked Questions
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

      {/* Related Services */}
      <section className="mt-16 rounded-2xl border border-line bg-card p-8">
        <h2 className="text-lg font-semibold">Explore Other Services in {cityName}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["hair-cut", "hair-color", "facial", "manicure", "pedicure", "bridal-makeup", "shaving", "beard-trim"]
            .filter((s) => s !== service)
            .map((s) => (
              <Link
                key={s}
                href={`/salons/${city}/${s}`}
                className="rounded-full border border-line px-4 py-2 text-sm text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
              >
                {formatService(s)}
              </Link>
            ))}
        </div>
      </section>

      {/* Related Cities */}
      <section className="mt-8 rounded-2xl border border-line bg-card p-8">
        <h2 className="text-lg font-semibold">{serviceName} in Other Cities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"]
            .filter((c) => c.toLowerCase() !== city.toLowerCase())
            .map((c) => (
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
    </div>
  );
}
