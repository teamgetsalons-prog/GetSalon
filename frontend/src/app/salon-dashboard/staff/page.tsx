// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { StaffManager, type StaffRow } from "@/components/dashboard/staff-manager";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonStaffPage() {
  const session = await auth();
  if (!session?.user) return null;

  let salon = null;
  let staffRows: StaffRow[] = [];
  let serviceOptions: { _id: string; name: string }[] = [];

  try {
    await connectDB();
    salon = await getActorSalon(session.user);
    if (salon) {
      const [staff, services] = await Promise.all([
        Staff.find({ salon: salon._id, isActive: true }).sort({ createdAt: 1 }),
        Service.find({ salon: salon._id, isActive: true }).select("name"),
      ]);
      staffRows = staff.map((m) => ({
        _id: m._id.toString(),
        name: m.name,
        title: m.title,
        bio: m.bio,
        avatar: m.avatar,
        serviceIds: m.services.map((s) => s.toString()),
        leaves: m.leaves.map((l) => ({ date: l.date, reason: l.reason })),
        rating: { average: m.rating.average, count: m.rating.count },
        isActive: m.isActive,
      }));
      serviceOptions = services.map((s) => ({
        _id: s._id.toString(),
        name: s.name,
      }));
    }
  } catch {
    salon = null;
  }
  if (!salon) return <NoSalonYet />;

  return (
    <StaffManager
      salonId={salon._id.toString()}
      initial={staffRows}
      services={serviceOptions}
    />
  );
}
