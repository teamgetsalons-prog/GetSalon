"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { GENDER_OPTIONS, SORT_OPTIONS } from "@getsalons/shared/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@getsalons/shared/utils";

interface Option {
  name: string;
  slug: string;
}

export function SalonFilters({
  cities,
  categories,
}: {
  cities: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page"); // filters reset pagination
      router.push(`/salons?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  const activeCount = ["city", "category", "gender", "rating", "homeService", "openNow", "maxPrice"].filter(
    (k) => params.get(k)
  ).length;

  const panel = (
    <div className="space-y-6">
      <FilterGroup label="City">
        <PillRow
          options={[{ name: "All", slug: "" }, ...cities]}
          current={params.get("city") ?? ""}
          onSelect={(v) => setParam("city", v || null)}
        />
      </FilterGroup>

      <FilterGroup label="Category">
        <PillRow
          options={[{ name: "All", slug: "" }, ...categories]}
          current={params.get("category") ?? ""}
          onSelect={(v) => setParam("category", v || null)}
        />
      </FilterGroup>

      <FilterGroup label="Suitable for">
        <PillRow
          options={[
            { name: "Any", slug: "" },
            ...GENDER_OPTIONS.map((g) => ({ name: g.label, slug: g.value })),
          ]}
          current={params.get("gender") ?? ""}
          onSelect={(v) => setParam("gender", v || null)}
        />
      </FilterGroup>

      <FilterGroup label="Minimum rating">
        <PillRow
          options={[
            { name: "Any", slug: "" },
            { name: "3★+", slug: "3" },
            { name: "4★+", slug: "4" },
            { name: "4.5★+", slug: "4.5" },
          ]}
          current={params.get("rating") ?? ""}
          onSelect={(v) => setParam("rating", v || null)}
        />
      </FilterGroup>

      <FilterGroup label="Budget (max price)">
        <PillRow
          options={[
            { name: "Any", slug: "" },
            { name: "Rs 1,000", slug: "1000" },
            { name: "Rs 3,000", slug: "3000" },
            { name: "Rs 10,000", slug: "10000" },
          ]}
          current={params.get("maxPrice") ?? ""}
          onSelect={(v) => setParam("maxPrice", v || null)}
        />
      </FilterGroup>

      <FilterGroup label="More">
        <div className="flex flex-wrap gap-2">
          <TogglePill
            label="Home Service"
            active={params.get("homeService") === "true"}
            onToggle={(on) => setParam("homeService", on ? "true" : null)}
          />
          <TogglePill
            label="Open Now"
            active={params.get("openNow") === "true"}
            onToggle={(on) => setParam("openNow", on ? "true" : null)}
          />
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/salons")}
          className="w-full"
        >
          <X className="h-3.5 w-3.5" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: filter button + sheet */}
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
        <SortSelect
          value={params.get("sort") ?? "recommended"}
          onChange={(v) => setParam("sort", v === "recommended" ? null : v)}
        />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-bg p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="cursor-pointer rounded-lg p-1 text-fg-muted hover:bg-bg-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}

      {/* Desktop: sidebar */}
      <aside className="sticky top-20 hidden h-fit w-64 shrink-0 rounded-2xl border border-line bg-card p-5 lg:block">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-faint">
            Filters
          </h2>
          <SlidersHorizontal className="h-4 w-4 text-fg-faint" />
        </div>
        {panel}
      </aside>
    </>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort results"
      className="h-9 cursor-pointer rounded-xl border border-line bg-card px-3 text-sm text-fg outline-none focus:border-gold-500 [color-scheme:light_dark]"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Desktop sort control shown in the results header */
export function DesktopSort() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <div className="hidden lg:block">
      <SortSelect
        value={params.get("sort") ?? "recommended"}
        onChange={(v) => {
          const next = new URLSearchParams(params.toString());
          if (v === "recommended") next.delete("sort");
          else next.set("sort", v);
          next.delete("page");
          router.push(`/salons?${next.toString()}`, { scroll: false });
        }}
      />
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-fg-faint">
        {label}
      </p>
      {children}
    </div>
  );
}

function PillRow({
  options,
  current,
  onSelect,
}: {
  options: Option[];
  current: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.slug || "all"}
          onClick={() => onSelect(opt.slug)}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            current === opt.slug
              ? "border-gold-500 bg-gold-500/15 text-gold"
              : "border-line text-fg-muted hover:border-gold-500/40 hover:text-fg"
          )}
        >
          {opt.name}
        </button>
      ))}
    </div>
  );
}

function TogglePill({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: (on: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!active)}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-gold-500 bg-gold-500/15 text-gold"
          : "border-line text-fg-muted hover:border-gold-500/40 hover:text-fg"
      )}
    >
      {label}
    </button>
  );
}
