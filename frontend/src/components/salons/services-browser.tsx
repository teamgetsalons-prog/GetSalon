"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import { formatDuration, formatPKR, formatPriceRange } from "@getsalons/shared/utils";
import { Badge } from "@/components/ui/badge";

export interface BrowsableService {
  _id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  discountPrice?: number;
  /** Upper end of a price range (e.g. Rs 1,000 - 1,500 by hair length). */
  priceMax?: number;
  isPopular?: boolean;
  category?: { _id: string; name: string } | null;
}

const OTHER_CATEGORY = "Other";

export function ServicesBrowser({
  services,
  salonSlug,
}: {
  services: BrowsableService[];
  salonSlug: string;
}) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? services.filter((s) => s.name.toLowerCase().includes(q))
      : services;

    const byCategory = new Map<string, BrowsableService[]>();
    for (const service of filtered) {
      const name = service.category?.name ?? OTHER_CATEGORY;
      const list = byCategory.get(name) ?? [];
      list.push(service);
      byCategory.set(name, list);
    }

    const names = [...byCategory.keys()].sort((a, b) => {
      if (a === OTHER_CATEGORY) return 1;
      if (b === OTHER_CATEGORY) return -1;
      return a.localeCompare(b);
    });

    return names.map((name) => ({ name, items: byCategory.get(name)! }));
  }, [services, query]);

  const totalMatches = grouped.reduce((sum, g) => sum + g.items.length, 0);

  function toggle(name: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  if (services.length === 0) {
    return (
      <p className="mt-3 text-sm text-fg-muted">
        This salon hasn&apos;t listed services yet.
      </p>
    );
  }

  return (
    <div className="mt-4">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services..."
          className="h-10 w-full max-w-xs rounded-xl border border-line bg-card pl-10 pr-9 text-sm text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-fg-faint hover:text-fg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results */}
      {totalMatches === 0 ? (
        <p className="mt-4 text-sm text-fg-muted">No services found.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {grouped.map((group) => {
            const isCollapsed = collapsed.has(group.name);
            return (
              <div
                key={group.name}
                className="overflow-hidden rounded-2xl border border-line bg-card"
              >
                <button
                  type="button"
                  onClick={() => toggle(group.name)}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 text-left sm:px-5"
                  aria-expanded={!isCollapsed}
                >
                  <span className="text-sm font-semibold text-fg">
                    {group.name}{" "}
                    <span className="font-normal text-fg-faint">
                      ({group.items.length})
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-fg-faint transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                  />
                </button>

                {!isCollapsed && (
                  <div className="divide-y divide-line border-t border-line">
                    {group.items.map((service) => {
                      const hasDiscount =
                        service.discountPrice !== undefined &&
                        service.discountPrice < service.price;
                      return (
                        <div
                          key={service._id}
                          className="flex items-center justify-between gap-4 p-4 sm:p-5"
                        >
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                              {service.name}
                              {service.isPopular && (
                                <Badge variant="gold">Popular</Badge>
                              )}
                            </p>
                            {service.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-fg-muted">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-fg-faint">
                                {formatDuration(service.duration)}
                              </p>
                              {hasDiscount && (
                                <p className="text-xs text-fg-faint line-through">
                                  {formatPKR(service.price)}
                                </p>
                              )}
                              <p className="text-sm font-bold text-gold">
                                {hasDiscount
                                  ? formatPKR(service.discountPrice!)
                                  : formatPriceRange(service.price, service.priceMax)}
                              </p>
                            </div>
                            <Link
                              href={`/book/${salonSlug}?service=${service._id}`}
                              className="rounded-xl bg-gold-500 px-4 py-2 text-xs font-semibold text-gold-950 transition-colors hover:bg-gold-400"
                            >
                              Book
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
