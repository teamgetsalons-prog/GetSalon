import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getSalonBranchesApi } from "@/lib/server-api";
import { buildMetadata } from "@/lib/seo";
import { SalonCard } from "@/components/salons/salon-card";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSalonBranchesApi(slug);
  if (!data) return { title: "Salon not found" };
  return buildMetadata({
    title: `All Branches of ${data.salonName}`,
    description: `Every GetSalons location run by ${data.salonName}.`,
    path: `/salon/${slug}/branches`,
    // Purely a navigation aid for an existing salon's other locations,
    // not a distinct piece of content worth ranking on its own.
    index: false,
  });
}

export default async function SalonBranchesPage({ params }: Params) {
  const { slug } = await params;
  const data = await getSalonBranchesApi(slug);
  if (!data) notFound();
  const { salonName, branches } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <nav className="py-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/salon/${slug}`} className="hover:text-gold">{salonName}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">Branches</span>
      </nav>

      <Link
        href={`/salon/${slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {salonName}
      </Link>

      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        All Branches of {salonName}
      </h1>
      <p className="mt-2 text-sm text-fg-muted">
        {branches.length} other location{branches.length === 1 ? "" : "s"} on GetSalons.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {branches.map((branch) => (
          <SalonCard key={branch._id} salon={branch} />
        ))}
      </div>
    </div>
  );
}
