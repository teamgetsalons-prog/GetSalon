import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store } from "lucide-react";
import { getSalonPageData, getServerSession } from "@/lib/server-api";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Book an appointment — ${slug.replace(/-/g, " ")}`,
    robots: { index: false },
  };
}

export default async function BookPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { service: preselectedService } = await searchParams;

  let data: Awaited<ReturnType<typeof getSalonPageData>> = null;
  try {
    data = await getSalonPageData(slug);
  } catch {
    data = null;
  }
  if (!data) notFound();

  const { salon, services, staff } = data;

  // Owners/staff can't book their own salon (the API rejects it too) -
  // show a friendly pointer to their dashboard instead of the wizard.
  const session = await getServerSession();
  if (session?.salonId === salon._id.toString()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/12 text-gold">
          <Store className="h-6 w-6" />
        </span>
        <h1 className="font-display mt-5 text-2xl font-bold">This is your salon</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
          You can&apos;t book an appointment at your own salon. Manage your
          bookings, services and team from your dashboard instead.
        </p>
        <Link
          href="/salon-dashboard"
          className="mt-6 inline-block rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
        >
          Go to salon dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <BookingWizard
        salon={{
          _id: salon._id.toString(),
          name: salon.name,
          slug: salon.slug,
          cityName: salon.cityName,
          address: salon.address,
          coverImage: salon.coverImage,
        }}
        services={services.map((s) => ({
          _id: s._id.toString(),
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: s.price,
          discountPrice: s.discountPrice,
          isPopular: s.isPopular,
        }))}
        staff={staff.map((m) => ({
          _id: m._id.toString(),
          name: m.name,
          title: m.title,
          avatar: m.avatar,
          serviceIds: m.services.map((id) => id.toString()),
          rating: m.rating,
        }))}
        preselectedServiceId={preselectedService}
      />
    </div>
  );
}
