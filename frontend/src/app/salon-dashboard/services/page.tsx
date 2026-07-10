// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import {
  ServicesManager,
  type ServiceRow,
} from "@/components/dashboard/services-manager";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonServicesPage() {
  const session = await auth();
  if (!session?.user) return null;

  let salon = null;
  let rows: ServiceRow[] = [];
  try {
    await connectDB();
    salon = await getActorSalon(session.user);
    if (salon) {
      const services = await Service.find({ salon: salon._id }).sort({
        createdAt: -1,
      });
      rows = services.map((s) => ({
        _id: s._id.toString(),
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
        discountPrice: s.discountPrice,
        isActive: s.isActive,
        isPopular: s.isPopular,
      }));
    }
  } catch {
    salon = null;
  }
  if (!salon) return <NoSalonYet />;

  return <ServicesManager salonId={salon._id.toString()} initial={rows} />;
}
