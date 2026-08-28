import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getBlogPosts } from "@/lib/server-api";
import { BlogCard } from "@/components/blog/blog-card";
import { SITE } from "@getsalons/shared/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

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
  const category = firstValue(sp.category);
  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")
    : undefined;

  return buildMetadata({
    title: categoryName
      ? `${categoryName} Articles — Beauty Blog | ${SITE.shortName}`
      : `Beauty Blog — Tips, Trends & Guides | ${SITE.shortName}`,
    description: categoryName
      ? `Read the latest ${categoryName.toLowerCase()} articles, tips and guides from the GetSalons beauty experts.`
      : "Expert beauty tips, hair care guides, skin care routines, bridal trends and salon guides for every city in Pakistan — from the GetSalons team.",
    path: "/blog",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const category = firstValue(sp.category);
  const page = Math.max(1, parseInt(firstValue(sp.page) || "1"));
  const limit = 24;

  const { posts, total, totalPages } = await getBlogPosts({
    page,
    limit,
    category,
  });

  const pageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />

      <div className="text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl animate-fade-in-up">
          The GetSalons <span className="text-gold-gradient">Beauty Blog</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-fg-muted animate-fade-in-up delay-100">
          Hair care, skin care, bridal trends and the best salons in every
          city — written by people obsessed with beauty.
        </p>
        {total > 0 && (
          <p className="mt-2 text-xs text-fg-faint">
            {total} article{total !== 1 ? "s" : ""} published
          </p>
        )}
      </div>

      {posts.length > 0 ? (
        <>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <div key={post._id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Blog pagination">
              {page > 1 && (
                <Link
                  href={pageUrl(page - 1)}
                  className="rounded-xl border border-line px-4 py-2 text-sm text-fg-muted hover:border-gold-500/50 hover:text-fg"
                >
                  ← Previous
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-sm text-fg-faint">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={pageUrl(p as number)}
                      className={`rounded-xl px-4 py-2 text-sm transition-colors ${
                        p === page
                          ? "bg-gold-500 font-semibold text-gold-950"
                          : "border border-line text-fg-muted hover:border-gold-500/50 hover:text-fg"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
              {page < totalPages && (
                <Link
                  href={pageUrl(page + 1)}
                  className="rounded-xl border border-line px-4 py-2 text-sm text-fg-muted hover:border-gold-500/50 hover:text-fg"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      ) : (
        <div className="mx-auto mt-12 flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center">
          <BookOpen className="h-10 w-10 text-gold" aria-hidden />
          <div>
            <p className="font-semibold text-fg">Articles coming soon</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">
              Our beauty editors are polishing the first stories. Meanwhile,
              discover top-rated salons near you.
            </p>
          </div>
          <Link
            href="/salons"
            className="rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
          >
            Browse salons
          </Link>
        </div>
      )}
    </div>
  );
}
