import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Star, MapPin, TrendingUp, Award } from "lucide-react";
import { getCitiesApi, searchSalonsApi } from "@/lib/server-api";
import { SalonCard } from "@/components/salons/salon-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";
import type { SalonCardData } from "@getsalons/shared/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const city = firstValue(sp.city);
  const cityName = city
    ? city.charAt(0).toUpperCase() + city.slice(1)
    : undefined;

  return buildMetadata({
    title: cityName
      ? `Top Rated Salons in ${cityName} — Best Reviewed | ${SITE.shortName}`
      : `Top Rated Salons in Pakistan — Best Reviewed | ${SITE.shortName}`,
    description: cityName
      ? `Discover the highest-rated salons in ${cityName}. Based on genuine customer reviews and ratings. Find the best beauty services near you.`
      : `Discover the highest-rated salons across Pakistan. Based on genuine customer reviews and ratings. Find the best beauty services near you.`,
    path: "/top-salons",
  });
}

export default async function TopSalonsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const city = firstValue(sp.city);

  // Top-rated salons (rating ≥ 1 ⇒ at least one review) + city filter list
  const [result, cities] = await Promise.all([
    searchSalonsApi({ sort: "rating", rating: 1, limit: 50, city }),
    getCitiesApi(),
  ]);
  const salonsData: SalonCardData[] = result.salons;

  // If no rated salons, fetch suggested salons (newest/featured) so page isn't empty
  let suggestedSalons: SalonCardData[] = [];
  if (salonsData.length === 0) {
    const suggested = await searchSalonsApi({
      sort: city ? "newest" : "featured",
      limit: 12,
      city,
    });
    suggestedSalons = suggested.salons;
  }

  // Get top 3 for hero display
  const topThree = salonsData.slice(0, 3);
  const remaining = salonsData.slice(3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top Salons", path: "/top-salons" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Top Rated Salons in Pakistan",
            description: "Discover the highest-rated salons across Pakistan based on genuine customer reviews",
            url: `${SITE.url}/top-salons`,
          },
        ]}
      />

      {/* Hero Section */}
      <div className="mb-8 animate-fade-in-up">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-fg-faint">
          <Link href="/" className="hover:text-gold">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-fg-muted">Top Salons</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gold-500/15 p-3">
            <Trophy className="h-8 w-8 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Top Rated Salons
            </h1>
            <p className="mt-1 text-fg-muted">
              {city
                ? `Highest-rated salons in ${city.charAt(0).toUpperCase() + city.slice(1)} based on genuine customer reviews`
                : "Highest-rated salons across Pakistan based on genuine customer reviews"}
            </p>
          </div>
        </div>

        {/* City Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/top-salons"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !city
                ? "bg-gold-500 text-gold-950"
                : "border border-line text-fg-muted hover:border-gold-500/50 hover:text-gold"
            }`}
          >
            All Cities
          </Link>
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={`/top-salons?city=${c.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                city === c.slug
                  ? "bg-gold-500 text-gold-950"
                  : "border border-line text-fg-muted hover:border-gold-500/50 hover:text-gold"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Top 3 Featured */}
      {topThree.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <Award className="h-5 w-5 text-gold" />
            Top 3 Salons
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {topThree.map((salon, i) => (
              <div
                key={salon._id}
                className={`relative overflow-hidden rounded-2xl border ${
                  i === 0
                    ? "border-gold shadow-lg shadow-gold/10"
                    : "border-line"
                } bg-card animate-fade-in-up`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {/* Rank Badge */}
                <div
                  className={`absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "bg-gold text-gold-950"
                      : i === 1
                        ? "bg-gray-300 text-gray-800"
                        : "bg-amber-600 text-white"
                  }`}
                >
                  #{i + 1}
                </div>

                <Link href={`/salon/${salon.slug}`}>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={salon.coverImage ?? ""}
                      alt={salon.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white">{salon.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-white/80">
                        <MapPin className="h-3.5 w-3.5" />
                        {salon.areaName ? `${salon.areaName}, ` : ""}
                        {salon.cityName}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-gold-400 text-gold-400" />
                      <span className="text-lg font-bold text-fg">
                        {salon.rating.average.toFixed(1)}
                      </span>
                      <span className="text-sm text-fg-faint">
                        ({salon.rating.count} reviews)
                      </span>
                    </div>
                    {salon.priceRange.min > 0 && (
                      <span className="text-sm text-fg-muted">
                        from{" "}
                        <span className="font-semibold text-gold">
                          Rs {salon.priceRange.min.toLocaleString("en-PK")}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remaining Salons */}
      {remaining.length > 0 && (
        <div>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-gold" />
            More Top-Rated Salons
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {remaining.map((salon, i) => (
              <div key={salon._id} className="relative animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}>
                <SalonCard salon={salon} />
              </div>
            ))}
          </div>
        </div>
      )}

      {salonsData.length === 0 && suggestedSalons.length > 0 && (
        <div>
          <div className="mb-6 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6">
            <div className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-gold shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold">No rated salons yet</h2>
                <p className="mt-1 text-sm text-fg-muted">
                  {city
                    ? `No salons in ${city.charAt(0).toUpperCase() + city.slice(1)} have received reviews yet.`
                    : "No salons have received reviews yet. Be the first to leave a review!"}
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  Here are some salons you might like:
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suggestedSalons.map((salon) => (
              <div key={salon._id} className="relative">
                <SalonCard salon={salon} />
              </div>
            ))}
          </div>
        </div>
      )}

      {salonsData.length === 0 && suggestedSalons.length === 0 && (
        <div className="rounded-2xl border border-line bg-card p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-fg-faint" />
          <h2 className="mt-4 text-lg font-semibold">No salons found</h2>
          <p className="mt-2 text-sm text-fg-muted">
            {city
              ? `No salons in ${city.charAt(0).toUpperCase() + city.slice(1)} yet.`
              : "No salons have been listed yet. Be the first to list your salon!"}
          </p>
          <Link
            href="/partner"
            className="mt-6 inline-flex rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
          >
            List Your Salon
          </Link>
        </div>
      )}
    </div>
  );
}
