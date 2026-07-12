import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Tag, Clock, Sparkles, Percent, ArrowRight, MapPin, Star } from "lucide-react";
import { getDealsApi, type DealPublic } from "@/lib/server-api";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { formatPKR } from "@getsalons/shared/utils";
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

export default async function OffersPage() {
  const result = await getDealsApi({ limit: 50 });
  const deals = result.deals;

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
          Save big on beauty services. Exclusive discounts from top-rated salons across Pakistan.
        </p>
      </div>

      {deals.length === 0 ? (
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
              <span className="font-semibold text-fg">{deals.length}</span> active deal{deals.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Updated daily
            </div>
          </div>

          {/* Deal cards */}
          {deals.map((deal, i) => (
            <DealCard key={deal._id} deal={deal} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function DealCard({ deal, index }: { deal: DealPublic; index: number }) {
  const salon = deal.salon;

  return (
    <Link
      href={`/salon/${salon.slug}?deal=${deal._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-lg sm:flex-row animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      {/* Image side */}
      <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-56">
        {deal.image ? (
          <Image
            src={deal.image}
            alt={deal.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 224px"
          />
        ) : salon.coverImage ? (
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
        {/* Discount badge */}
        <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
          {deal.discountPercent}% OFF
        </span>
        {deal.isFeatured && (
          <span className="absolute right-3 top-3">
            <Badge variant="gold">★ Featured</Badge>
          </span>
        )}
      </div>

      {/* Content side */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-bold group-hover:text-gold">
              {deal.title}
            </h2>
          </div>

          <p className="mt-1 text-sm text-fg-muted line-clamp-2">
            {deal.description}
          </p>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-xl font-bold text-gold">{formatPKR(deal.dealPrice)}</span>
            <span className="text-sm text-fg-faint line-through">{formatPKR(deal.originalPrice)}</span>
          </div>

          {deal.terms && (
            <p className="mt-2 text-xs text-fg-faint">{deal.terms}</p>
          )}

          {/* Salon info */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {salon.name}
            </span>
            <span>{salon.cityName}</span>
            {salon.rating.count > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-gold text-gold" />
                {salon.rating.average.toFixed(1)} ({salon.rating.count})
              </span>
            )}
            {salon.isVerified && (
              <Badge variant="gold" className="text-[10px]">Verified</Badge>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          {deal.endDate ? (
            <span className="flex items-center gap-1.5 text-xs text-fg-muted">
              <Clock className="h-3.5 w-3.5" />
              Ends {new Date(deal.endDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-green-500">
              <Clock className="h-3.5 w-3.5" />
              Limited time offer
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold group-hover:gap-2 transition-all">
            View deal <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
