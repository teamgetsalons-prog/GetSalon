import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCategoriesApi,
  getCitiesApi,
  getServerSession,
} from "@/lib/server-api";
import { SalonRegisterForm } from "@/components/partner/salon-register-form";

export const metadata: Metadata = {
  title: "Add a branch",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function NewBranchPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/branches/new");

  const [cities, categories] = await Promise.all([
    getCitiesApi(true),
    getCategoriesApi(),
  ]);

  const cityOptions = cities.map((c) => ({
    _id: c._id,
    name: c.name,
    areas: (c.areas ?? []).map((a) => ({ _id: a._id, name: a.name })),
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-6 text-xs text-fg-faint">
        <Link href="/salon-dashboard/branches" className="hover:text-gold">Branches</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">Add branch</span>
      </nav>

      <h1 className="font-display text-2xl font-bold sm:text-3xl">Add a new branch</h1>
      <p className="mt-2 text-sm text-fg-muted">
        This creates a new branch under your account. Our team reviews every
        new location before it goes live — you can add services, staff and
        photos for it right after submitting.
      </p>

      <div className="mt-8">
        <SalonRegisterForm
          cities={cityOptions}
          categories={categories.map((c) => ({ _id: c._id, name: c.name }))}
        />
      </div>
    </div>
  );
}
