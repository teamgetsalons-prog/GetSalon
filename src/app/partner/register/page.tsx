import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { connectDB } from "@/server/db";
import { Area, Category, City, Salon } from "@/server/models";
import { SalonRegisterForm } from "@/components/partner/salon-register-form";

export const metadata: Metadata = {
  title: "Register your salon",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function PartnerRegisterPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/register?as=owner");
  }

  await connectDB();

  // Owners with an existing salon go straight to their dashboard
  const existing = await Salon.findOne({ owner: session.user.id }).select("_id");
  if (existing) redirect("/salon-dashboard");

  const [cities, areas, categories] = await Promise.all([
    City.find({ isActive: true }).sort({ order: 1 }).select("name"),
    Area.find({ isActive: true }).select("name city"),
    Category.find({ isActive: true }).sort({ order: 1 }).select("name"),
  ]);

  const cityOptions = cities.map((c) => ({
    _id: c._id.toString(),
    name: c.name,
    areas: areas
      .filter((a) => a.city.toString() === c._id.toString())
      .map((a) => ({ _id: a._id.toString(), name: a.name })),
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
          categories={categories.map((c) => ({
            _id: c._id.toString(),
            name: c.name,
          }))}
        />
      </div>
    </div>
  );
}
