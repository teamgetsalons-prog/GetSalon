import { redirect } from "next/navigation";
import { getCategoriesApi, getServerSession, serverFetch } from "@/lib/server-api";
import {
  ServicesManager,
  type ServiceRow,
} from "@/components/dashboard/services-manager";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonServicesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/services");
  if (!session.salonId) return <NoSalonYet />;

  const [res, categories] = await Promise.all([
    serverFetch<ServiceRow[]>(`/services?salonId=${session.salonId}&all=1`),
    getCategoriesApi(),
  ]);
  const rows = res.success && res.data ? res.data : [];

  return (
    <ServicesManager
      salonId={session.salonId}
      categories={categories.map((c) => ({ _id: c._id, name: c.name }))}
      initial={rows.map((s) => ({
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
    />
  );
}
