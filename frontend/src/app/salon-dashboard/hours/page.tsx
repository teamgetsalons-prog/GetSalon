// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { HoursEditor } from "@/components/dashboard/hours-editor";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonHoursPage() {
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
    <HoursEditor
      salonId={salon._id.toString()}
      initial={salon.openingHours.map((h) => ({
        day: h.day,
        open: h.open,
        close: h.close,
        isClosed: h.isClosed,
      }))}
    />
  );
}
