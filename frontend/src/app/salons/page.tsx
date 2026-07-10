import type { Metadata } from "next";
import Link from "next/link";
import {
  getCategoriesApi,
  getCitiesApi,
  searchSalonsApi,
  type SearchSalonsResult,
} from "@/lib/server-api";
import { searchSalonsSchema } from "@getsalons/shared/validations/salon";
import { SalonCard } from "@/components/salons/salon-card";
import { DesktopSort, SalonFilters } from "@/components/salons/filters";
import { EmptyState } from "@/components/ui/misc";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

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
  const category = firstValue(sp.category);

  const cityName = city
    ? city.charAt(0).toUpperCase() + city.slice(1)
    : undefined;
  const catName = category
    ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : undefined;

  const title = [catName, "Salons", cityName ? `in ${cityName}` : "in Pakistan"]
    .filter(Boolean)
    .join(" ");

  return buildMetadata({
    title: `${title} — Compare Prices & Book Online`,
    description: `Find and book the best ${catName ? `${catName.toLowerCase()} ` : ""}salons${cityName ? ` in ${cityName}` : " across Pakistan"}. Compare prices, read verified reviews and book appointments online for free.`,
    path: "/salons",
  });
}

export default async function SalonsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = firstValue(v);
    if (val !== undefined) flat[k] = val;
  }

  const parsed = searchSalonsSchema.safeParse(flat);
  const input = parsed.success ? parsed.data : searchSalonsSchema.parse({});

  const [result, cityDocs, catDocs]: [
    SearchSalonsResult,
    Awaited<ReturnType<typeof getCitiesApi>>,
    Awaited<ReturnType<typeof getCategoriesApi>>,
  ] = await Promise.all([
    searchSalonsApi(input),
    getCitiesApi(),
    getCategoriesApi(),
  ]);

  const cities = cityDocs.map((c) => ({ name: c.name, slug: c.slug }));
  const categories = catDocs.map((c) => ({ name: c.name, slug: c.slug }));

  const pageUrl = (page: number) => {
    const next = new URLSearchParams(flat);
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    const qs = next.toString();
    return `/salons${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Salons", path: "/salons" },
        ])}
      />

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          {input.q ? `Results for “${input.q}”` : "Find your perfect salon"}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          {result.total} salon{result.total === 1 ? "" : "s"} found
          {input.city ? ` in ${cities.find((c) => c.slug === input.city)?.name ?? input.city}` : ""}
        </p>
      </div>

      <div className="flex gap-6">
        <SalonFilters cities={cities} categories={categories} />

        <div className="min-w-0 flex-1">
          <div className="mb-4 hidden justify-end lg:flex">
            <DesktopSort />
          </div>

          {result.salons.length === 0 ? (
            <EmptyState
              title="No salons match your filters"
              hint="Try removing a filter or two, or search a different city. New salons join GetSalons every week."
              action={
                <Link
                  href="/salons"
                  className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-gold-950 hover:bg-gold-400"
                >
                  Clear filters
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.salons.map((salon) => (
                  <SalonCard key={salon._id} salon={salon} />
                ))}
              </div>

              {result.totalPages > 1 && (
                <nav
                  className="mt-8 flex items-center justify-center gap-2"
                  aria-label="Pagination"
                >
                  {result.page > 1 && (
                    <Link
                      href={pageUrl(result.page - 1)}
                      className="rounded-xl border border-line px-4 py-2 text-sm text-fg-muted hover:border-gold-500/50 hover:text-fg"
                    >
                      ← Previous
                    </Link>
                  )}
                  <span className="px-3 text-sm text-fg-muted">
                    Page {result.page} of {result.totalPages}
                  </span>
                  {result.page < result.totalPages && (
                    <Link
                      href={pageUrl(result.page + 1)}
                      className="rounded-xl border border-line px-4 py-2 text-sm text-fg-muted hover:border-gold-500/50 hover:text-fg"
                    >
                      Next →
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
