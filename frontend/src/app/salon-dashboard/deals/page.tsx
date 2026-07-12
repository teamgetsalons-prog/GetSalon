import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession, getManagedSalon } from "@/lib/server-api";
import { DealsManager } from "@/components/dashboard/deals-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Deals & Offers — Salon Dashboard",
  robots: { index: false },
};

export default async function SalonDealsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/deals");
  if (!["owner", "staff", "admin"].includes(session.role)) redirect("/dashboard");

  const salon = await getManagedSalon();
  if (!salon) redirect("/salon-dashboard");

  return (
    <div>
      <DealsManager salonId={salon._id} />
    </div>
  );
}
