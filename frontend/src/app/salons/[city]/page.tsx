import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star, Clock, CheckCircle } from "lucide-react";
// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { searchSalonsSchema } from "@getsalons/shared/validations/salon";
import { SalonCard } from "@/components/salons/salon-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  return buildMetadata({
    title: `Best Salons in ${cityName} — Book Online | ${SITE.shortName}`,
    description: `Discover and book the best salons, beauty parlours and spas in ${cityName}. Compare prices, read verified reviews and book appointments online for free.`,
    path: `/salons/${city}`,
  });
}

export default async function CitySalonsPage({ params }: Params) {
  const { city } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  const input = searchSalonsSchema.parse({ city });

  let result = { salons: [], total: 0, page: 1, totalPages: 0 } as Awaited<
    ReturnType<typeof searchSalons>
  >;
  let categories: { name: string; slug: string }[] = [];

  try {
    await connectDB();
    const [res, catDocs] = await Promise.all([
      searchSalons(input),
      Category.find({ isActive: true }).sort({ order: 1 }).select("name slug"),
    ]);
    result = res;
    categories = catDocs.map((c) => ({ name: c.name, slug: c.slug }));
  } catch {
    // DB unavailable
  }

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

      {/* Internal Links */}
      <section className="mt-16 rounded-2xl border border-line bg-card p-8">
        <h2 className="text-lg font-semibold">Explore Salons in Other Cities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"]
            .filter((c) => c.toLowerCase() !== city.toLowerCase())
            .map((c) => (
              <Link
                key={c}
                href={`/salons/${c.toLowerCase()}`}
                className="rounded-full border border-line px-4 py-2 text-sm text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
              >
                Salons in {c}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
