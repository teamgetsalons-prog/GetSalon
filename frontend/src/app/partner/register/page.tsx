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
  title: "Register your salon",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function PartnerRegisterPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/register?as=owner");
  }

  // Owners with an existing salon go straight to their dashboard
  if (session.salonId) {
    redirect("/salon-dashboard");
  }

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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-xs text-fg-faint">
        <Link href="/partner" className="hover:text-gold">For Business</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">Register salon</span>
      </nav>

      <h1 className="font-display text-3xl font-bold">Tell us about your salon</h1>
      <p className="mt-2 text-sm text-fg-muted">
        This creates your public profile. You can add services, staff, photos
        and working hours from your dashboard right after.
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
