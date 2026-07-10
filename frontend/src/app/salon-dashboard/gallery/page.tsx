// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { GalleryManager } from "@/components/dashboard/gallery-manager";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonGalleryPage() {
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
    <GalleryManager
      salonId={salon._id.toString()}
      initial={salon.gallery.map((g) => ({
        url: g.url,
        publicId: g.publicId,
        caption: g.caption,
      }))}
    />
  );
}
