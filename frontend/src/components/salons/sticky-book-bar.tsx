import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { formatPKR } from "@getsalons/shared/utils";

/** Mobile-only persistent CTA - desktop already has a sticky sidebar button. */
export function StickyBookBar({
  salonSlug,
  priceRange,
}: {
  salonSlug: string;
  priceRange?: { min: number; max: number };
}) {
  return (
    <div className="glass fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
      <div className="min-w-0">
        <p className="text-[11px] text-fg-muted">Starting from</p>
        <p className="truncate text-sm font-bold text-gold">
          {priceRange && priceRange.min > 0 ? formatPKR(priceRange.min) : "Book now"}
        </p>
      </div>
      <Link
        href={`/book/${salonSlug}`}
        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-gold-950 transition-colors hover:bg-gold-400"
      >
        <CalendarCheck className="h-4.5 w-4.5" /> Book Appointment
      </Link>
    </div>
  );
}
