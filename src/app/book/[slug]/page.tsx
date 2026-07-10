import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSalonPageData } from "@/server/services/salon.service";
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
