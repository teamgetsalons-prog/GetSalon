import { redirect } from "next/navigation";
import { getManagedSalon, getServerSession } from "@/lib/server-api";
import { SalonSettingsForm } from "@/components/dashboard/salon-settings-form";
import { NoSalonYet } from "@/components/dashboard/no-salon";
import type { GenderServed } from "@getsalons/shared/types";

export const dynamic = "force-dynamic";

export default async function SalonSettingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/settings");

  const salon = await getManagedSalon();
  if (!salon) return <NoSalonYet />;

  return (
    <SalonSettingsForm
      salonId={salon._id}
      initial={{
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
        instagram: salon.socials?.instagram ?? "",
        facebook: salon.socials?.facebook ?? "",
        cancellationPolicy: salon.policies?.cancellation ?? "",
      }}
    />
  );
}
