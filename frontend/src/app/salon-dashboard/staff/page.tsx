import { redirect } from "next/navigation";
import { getServerSession, serverFetch } from "@/lib/server-api";
import { StaffManager, type StaffRow } from "@/components/dashboard/staff-manager";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

interface StaffApiRow {
  _id: string;
  name: string;
  title?: string;
  bio?: string;
  avatar?: string;
  services?: ({ _id: string } | string)[];
  leaves?: { date: string; reason?: string }[];
  rating?: { average: number; count: number };
  isActive: boolean;
}

interface ServiceApiRow {
  _id: string;
  name: string;
}

export default async function SalonStaffPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/staff");
  if (!session.salonId) return <NoSalonYet />;

  const [staffRes, servicesRes] = await Promise.all([
    serverFetch<StaffApiRow[]>(`/staff?salonId=${session.salonId}`),
    serverFetch<ServiceApiRow[]>(`/services?salonId=${session.salonId}`),
  ]);

  const staffRows: StaffRow[] = (staffRes.data ?? []).map((m) => ({
    _id: String(m._id),
    name: m.name,
    title: m.title,
    bio: m.bio,
    avatar: m.avatar,
    serviceIds: (m.services ?? []).map((s) =>
      typeof s === "string" ? s : String(s._id)
    ),
    leaves: (m.leaves ?? []).map((l) => ({ date: l.date, reason: l.reason })),
    rating: { average: m.rating?.average ?? 0, count: m.rating?.count ?? 0 },
    isActive: m.isActive,
  }));

  const serviceOptions = (servicesRes.data ?? []).map((s) => ({
    _id: String(s._id),
    name: s.name,
  }));

  return (
    <StaffManager
      salonId={session.salonId}
      initial={staffRows}
      services={serviceOptions}
    />
  );
}
