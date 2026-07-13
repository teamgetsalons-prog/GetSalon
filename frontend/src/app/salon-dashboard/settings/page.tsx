import { redirect } from "next/navigation";
import { getCategoriesApi, getManagedSalon, getServerSession } from "@/lib/server-api";
import { SalonSettingsForm } from "@/components/dashboard/salon-settings-form";
import { NoSalonYet } from "@/components/dashboard/no-salon";
import type { GenderServed } from "@getsalons/shared/types";

export const dynamic = "force-dynamic";

export default async function SalonSettingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/settings");

  const salon = await getManagedSalon();
  if (!salon) return <NoSalonYet />;

  const categories = await getCategoriesApi();

  return (
    <SalonSettingsForm
      salonId={salon._id}
      categories={categories.map((c) => ({ _id: c._id, name: c.name }))}
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
        tiktok: salon.socials?.tiktok ?? "",
        cancellationPolicy: salon.policies?.cancellation ?? "",
        categoryIds: (salon.categories ?? []).map((c) => c._id),
      }}
    />
  );
}
