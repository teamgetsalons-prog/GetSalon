import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Home, MapPin } from "lucide-react";
import type { SalonCardData } from "@getsalons/shared/types";
import { formatPKR } from "@getsalons/shared/utils";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";

const genderLabel = {
  men: "Men Only",
  women: "Women Only",
  unisex: "Unisex",
} as const;

export function SalonCard({ salon }: { salon: SalonCardData }) {
  return (
    <Link
      href={`/salon/${salon.slug}`}
      className="group overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={salon.coverImage}
          alt={salon.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {salon.isFeatured && <Badge variant="gold">★ Featured</Badge>}
          {salon.homeService && (
            <Badge variant="neutral" className="bg-black/50 text-white border-white/20">
              <Home className="h-3 w-3" /> Home Service
            </Badge>
          )}
        </div>
        <span className="absolute bottom-2.5 left-3 text-xs font-medium text-white/90">
          {genderLabel[salon.genderServed]}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-fg group-hover:text-gold">
            {salon.name}
          </h3>
          {salon.isVerified && (
            <BadgeCheck
              className="h-4.5 w-4.5 shrink-0 text-gold"
              aria-label="Verified salon"
            />
          )}
        </div>

        <p className="mt-1 flex items-center gap-1 text-xs text-fg-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {salon.areaName ? `${salon.areaName}, ` : ""}
            {salon.cityName}
          </span>
        </p>

        <div className="mt-3 flex items-center justify-between">
          {salon.rating.count > 0 ? (
            <StarRating
              value={salon.rating.average}
              showValue
              count={salon.rating.count}
            />
          ) : (
            <span className="text-xs text-fg-faint">New on GetSalons</span>
          )}
          {salon.priceRange.min > 0 && (
            <span className="text-xs font-medium text-fg-muted">
              from{" "}
              <span className="text-sm font-semibold text-gold">
                {formatPKR(salon.priceRange.min)}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
