import { redirect } from "next/navigation";
import { getManagedSalon, getServerSession } from "@/lib/server-api";
import { GalleryManager } from "@/components/dashboard/gallery-manager";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonGalleryPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/gallery");

  const salon = await getManagedSalon();
  if (!salon) return <NoSalonYet />;

  return (
    <GalleryManager
      salonId={salon._id}
      initialCover={salon.coverImage}
      initial={(salon.gallery ?? []).map((g) => ({
        _id: (g as { _id?: string })._id,
        url: g.url,
        publicId: g.publicId,
        caption: g.caption,
      }))}
    />
  );
}
