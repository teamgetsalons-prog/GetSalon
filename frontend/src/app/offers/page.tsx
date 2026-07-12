import type { Metadata } from "next";
import Link from "next/link";
import { Tag, Clock, Sparkles, Percent, ArrowRight } from "lucide-react";
import { searchSalonsApi, type SearchSalonsResult } from "@/lib/server-api";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { formatPKR } from "@getsalons/shared/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: `Deals & Offers — Discounted Salon Services | ${SITE.shortName}`,
    description:
      "Find the best deals and discounted salon services across Pakistan. Save on haircuts, facials, bridal packages and more at top-rated salons.",
    path: "/offers",
  });
}

interface DealService {
  name: string;
  price: number;
  discountPrice: number;
  duration: number;
  salonName: string;
  salonSlug: string;
  salonImage: string;
  cityName: string;
}

export default async function OffersPage() {
  // Fetch all salons with deals
  const result = await searchSalonsApi({ deals: true, limit: 50 });

  // Extract all discounted services from all salons
  // We need to fetch each salon's services to show actual deals
  const dealSalons = result.salons;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Offers", path: "/offers" },
        ])}
      />

      {/* Hero */}
      <div className="mb-10 text-center animate-fade-in-up">
        <span className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold">
          <Tag className="h-3.5 w-3.5" />
          Limited Time Offers
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Deals & <span className="text-gold-gradient">Offers</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-fg-muted">
          Save big on beauty services. These salons are offering exclusive discounts right now.
        </p>
      </div>

      {dealSalons.length === 0 ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-line py-16 text-center">
          <Percent className="mx-auto h-10 w-10 text-gold" aria-hidden />
          <p className="mt-4 font-semibold text-fg">No deals available right now</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">
            Check back soon — salons regularly add new offers and seasonal discounts.
          </p>
          <Link
            href="/salons"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
          >
            Browse all salons <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between rounded-2xl border border-line bg-card p-4">
            <p className="text-sm text-fg-muted">
              <span className="font-semibold text-fg">{dealSalons.length}</span> salon{dealSalons.length !== 1 ? "s" : ""} with active deals
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Updated daily
            </div>
          </div>

          {/* Deal cards - list layout */}
          {dealSalons.map((salon, i) => (
            <DealCard key={salon._id} salon={salon} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function DealCard({
  salon,
  index,
}: {
  salon: {
    _id: string;
    name: string;
    slug: string;
    coverImage: string | null;
    cityName: string;
    areaName?: string | null;
    rating: { average: number; count: number };
    priceRange: { min: number; max: number };
    categoryNames: string[];
    isFeatured: boolean;
    isVerified: boolean;
  };
  index: number;
}) {
  const discount = salon.priceRange.max > 0
    ? Math.round(((salon.priceRange.max - salon.priceRange.min) / salon.priceRange.max) * 100)
    : 0;

  return (
    <Link
      href={`/salon/${salon.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-lg sm:flex-row animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-56">
        {salon.coverImage ? (
          <Image
            src={salon.coverImage}
            alt={salon.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 224px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-bg-soft">
            <Tag className="h-8 w-8 text-fg-faint" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            Up to {discount}% OFF
          </span>
        )}
        {salon.isFeatured && (
          <span className="absolute right-3 top-3">
            <Badge variant="gold">★ Featured</Badge>
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-bold group-hover:text-gold">
              {salon.name}
            </h2>
            {salon.isVerified && (
              <Badge variant="gold" className="shrink-0">Verified</Badge>
            )}
          </div>

          <p className="mt-1 text-sm text-fg-muted">
            {salon.areaName ? `${salon.areaName}, ` : ""}{salon.cityName}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {salon.categoryNames.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="rounded-lg bg-bg-soft px-2.5 py-1 text-xs text-fg-muted"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <div className="flex items-center gap-3 text-sm">
            {salon.rating.count > 0 ? (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-gold">★</span>
                {salon.rating.average.toFixed(1)}
                <span className="text-fg-faint">({salon.rating.count})</span>
              </span>
            ) : (
              <span className="text-fg-faint">New salon</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-fg-faint">Services from</p>
            <p className="text-sm font-bold text-gold">
              {salon.priceRange.min > 0 ? formatPKR(salon.priceRange.min) : "View prices"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
