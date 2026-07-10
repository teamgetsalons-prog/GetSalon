import Link from "next/link";
import { Search } from "lucide-react";
// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { toDateKey } from "@getsalons/shared/utils";
import { StatCard } from "@/components/dashboard/shell";
import { BookingList } from "@/components/dashboard/booking-list";

export const dynamic = "force-dynamic";

export default async function CustomerOverviewPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let stats = { upcoming: 0, completed: 0, favorites: 0, reviews: 0 };
  try {
    await connectDB();
    const [upcoming, completed, userDoc, reviews] = await Promise.all([
      Appointment.countDocuments({
        customer: userId,
        date: { $gte: toDateKey(new Date()) },
        status: { $in: ["pending", "confirmed"] },
      }),
      Appointment.countDocuments({ customer: userId, status: "completed" }),
      User.findById(userId).select("favorites"),
      Review.countDocuments({ customer: userId }),
    ]);
    stats = {
      upcoming,
      completed,
      favorites: userDoc?.favorites.length ?? 0,
      reviews,
    };
  } catch {
    // render with zeros if DB is unreachable
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Upcoming" value={stats.upcoming} icon="calendar" />
        <StatCard label="Visits completed" value={stats.completed} icon="star" />
        <StatCard label="Favourites" value={stats.favorites} icon="heart" />
        <StatCard label="Reviews written" value={stats.reviews} icon="star" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your appointments</h2>
          <Link
            href="/salons"
            className="flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
          >
            <Search className="h-4 w-4" /> Book new
          </Link>
        </div>
        <BookingList role="customer" />
      </div>
    </div>
  );
}
