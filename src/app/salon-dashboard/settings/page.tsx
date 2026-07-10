import { auth } from "@/server/auth";
import { connectDB } from "@/server/db";
import { getActorSalon } from "@/server/services/salon.service";
import { SalonSettingsForm } from "@/components/dashboard/salon-settings-form";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonSettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  let salon = null;
  try {
    await connectDB();
    salon = await getActorSalon(session.user);
  } catch {
    salon = null;
  }
  if (!salon) return <NoSalonYet />;

  return (
    <SalonSettingsForm
      salonId={salon._id.toString()}
      initial={{
        name: salon.name,
        description: salon.description,
        about: salon.about ?? "",
        address: salon.address,
        phone: salon.phone,
        whatsapp: salon.whatsapp ?? "",
        email: salon.email ?? "",
        website: salon.website ?? "",
        genderServed: salon.genderServed,
        homeService: salon.homeService,
        instagram: salon.socials?.instagram ?? "",
        facebook: salon.socials?.facebook ?? "",
        cancellationPolicy: salon.policies?.cancellation ?? "",
      }}
    />
  );
}
