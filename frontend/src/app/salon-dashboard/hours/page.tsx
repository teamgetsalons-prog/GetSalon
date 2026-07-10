import { redirect } from "next/navigation";
import { getManagedSalon, getServerSession } from "@/lib/server-api";
import { HoursEditor } from "@/components/dashboard/hours-editor";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonHoursPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/hours");

  const salon = await getManagedSalon();
  if (!salon) return <NoSalonYet />;

  return (
    <HoursEditor
      salonId={salon._id}
      initial={(salon.openingHours ?? []).map((h) => ({
        day: h.day,
        open: h.open,
        close: h.close,
        isClosed: h.isClosed,
      }))}
    />
  );
}
