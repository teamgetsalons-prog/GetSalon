import { redirect } from "next/navigation";
import { getServerSession, serverFetch } from "@/lib/server-api";
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

  const res = await serverFetch<ServiceRow[]>(
    `/services?salonId=${session.salonId}&all=1`
  );
  const rows = res.success && res.data ? res.data : [];

  return (
    <ServicesManager
      salonId={session.salonId}
      initial={rows.map((s) => ({
        _id: String(s._id),
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
        discountPrice: s.discountPrice,
        isActive: s.isActive,
        isPopular: s.isPopular,
      }))}
    />
  );
}
