import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Beauty Blog — Tips, Trends & City Guides",
  description:
    "Expert beauty tips, hair care guides, skin care routines, bridal trends and salon guides for every city in Pakistan — from the GetSalons team.",
  path: "/blog",
});

/**
 * The blog is being migrated to the new backend API.
 * Until blog endpoints ship, this renders a friendly placeholder
 * instead of hitting a non-existent data source.
 */
export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          The GetSalons <span className="text-gold-gradient">Beauty Blog</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-fg-muted">
          Hair care, skin care, bridal trends and the best salons in every
          city — written by people obsessed with beauty.
        </p>
      </div>

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
    </div>
  );
}
