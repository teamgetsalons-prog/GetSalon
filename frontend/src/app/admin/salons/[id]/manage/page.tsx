import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  getCategoriesApi,
  serverFetch,
  type ManagedSalon,
} from "@/lib/server-api";
import type { ServiceRow } from "@/components/dashboard/services-manager";
import { SalonManageTabs } from "@/components/admin/salon-manage-tabs";
import { Badge } from "@/components/ui/badge";
import type { GenderServed } from "@getsalons/shared/types";

export const dynamic = "force-dynamic";

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  suspended: "neutral",
} as const;

export default async function AdminSalonManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [salonRes, servicesRes, categories] = await Promise.all([
    serverFetch<ManagedSalon>(`/salons/${id}`),
    serverFetch<ServiceRow[]>(`/services?salonId=${id}&all=1`),
    getCategoriesApi(),
  ]);
  if (!salonRes.success || !salonRes.data) notFound();
  const salon = salonRes.data;
  const services = servicesRes.success && servicesRes.data ? servicesRes.data : [];

  return (
    <div>
      <div className="mb-5">
        <Link
          href="/admin/salons"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All salons
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold">{salon.name}</h1>
          <Badge variant={statusVariant[salon.status]}>{salon.status}</Badge>
          {salon.status === "approved" && (
            <Link
              href={`/salon/${salon.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
            >
              View live <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
        <p className="mt-1 text-sm text-fg-muted">
          {salon.cityName} · {salon.address}
        </p>
      </div>

      <SalonManageTabs
        salonId={salon._id}
        categories={categories.map((c) => ({ _id: c._id, name: c.name }))}
        settingsInitial={{
          name: salon.name,
          description: salon.description,
          about: salon.about ?? "",
          address: salon.address,
          phone: salon.phone,
          whatsapp: salon.whatsapp ?? "",
          email: salon.email ?? "",
          website: salon.website ?? "",
          genderServed: salon.genderServed as GenderServed,
          homeService: salon.homeService,
          amenities: salon.amenities ?? [],
          instagram: salon.socials?.instagram ?? "",
          facebook: salon.socials?.facebook ?? "",
          tiktok: salon.socials?.tiktok ?? "",
          cancellationPolicy: salon.policies?.cancellation ?? "",
          categoryIds: (salon.categories ?? []).map((c) => c._id),
          latitude: salon.location?.coordinates ? salon.location.coordinates[1] : undefined,
          longitude: salon.location?.coordinates ? salon.location.coordinates[0] : undefined,
          cityName: salon.cityName,
        }}
        services={services.map((s) => ({
          _id: String(s._id),
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: s.price,
          discountPrice: s.discountPrice,
          priceMax: s.priceMax,
          isActive: s.isActive,
          isPopular: s.isPopular,
          category: s.category,
        }))}
        coverImage={salon.coverImage}
        logo={salon.logo}
        gallery={(salon.gallery ?? []).map((g) => ({
          _id: (g as { _id?: string })._id,
          url: g.url,
          publicId: g.publicId,
          caption: g.caption,
        }))}
      />
    </div>
  );
}
