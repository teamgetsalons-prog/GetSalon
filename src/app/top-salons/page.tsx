import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Star, MapPin, TrendingUp, Award } from "lucide-react";
import { connectDB } from "@/server/db";
import { Salon, City } from "@/server/models";
import { toSalonCard } from "@/server/services/salon.service";
import { SalonCard } from "@/components/salons/salon-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import type { SalonCardData } from "@/types";
import type { ISalon } from "@/server/models";

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

  await connectDB();

  // Build filter
  const filter: Record<string, unknown> = {
    status: "approved",
    "rating.count": { $gte: 1 },
  };

  if (city) {
    const cityDoc = await City.findOne({ slug: city }).select("_id");
    if (cityDoc) {
      filter.city = cityDoc._id;
    }
  }

  // Get top-rated salons sorted by rating average and count
  const salons = await Salon.find(filter)
    .sort({
      "rating.average": -1,
      "rating.count": -1,
    })
    .limit(50)
    .populate("categories", "name")
    .lean();

  const salonsData: SalonCardData[] = salons.map((s) =>
    toSalonCard(s as unknown as ISalon & { categories: { name?: string }[] })
  );

  // Get all cities for filter
  const cities = await City.find({ isActive: true })
    .sort({ order: 1 })
    .select("name slug")
    .lean();

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
      <div className="mb-8">
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
                } bg-card`}
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
                      src={salon.coverImage}
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
            {remaining.map((salon) => (
              <div key={salon._id} className="relative">
                <SalonCard salon={salon} />
              </div>
            ))}
          </div>
        </div>
      )}

      {salonsData.length === 0 && (
        <div className="rounded-2xl border border-line bg-card p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-fg-faint" />
          <h2 className="mt-4 text-lg font-semibold">No rated salons found</h2>
          <p className="mt-2 text-sm text-fg-muted">
            {city
              ? `No salons in ${city.charAt(0).toUpperCase() + city.slice(1)} have received reviews yet.`
              : "No salons have received reviews yet. Be the first to leave a review!"}
          </p>
          <Link
            href="/salons"
            className="mt-6 inline-flex rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
          >
            Browse All Salons
          </Link>
        </div>
      )}
    </div>
  );
}
