import Link from "next/link";
import { Clock } from "lucide-react";
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { formatPKR, toDateKey } from "@getsalons/shared/utils";
import { StatCard } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  let stats = {
    salons: 0,
    pending: 0,
    customers: 0,
    owners: 0,
    bookings: 0,
    bookingsToday: 0,
    reviews: 0,
    revenue: 0,
  };

  try {
    await connectDB();
    const today = toDateKey(new Date());
    const [
      salons,
      pending,
      customers,
      owners,
      bookings,
      bookingsToday,
      reviews,
      revenueAgg,
    ] = await Promise.all([
      Salon.countDocuments({ status: "approved" }),
      Salon.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "owner" }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ date: today }),
      Review.countDocuments({ status: "published" }),
      Appointment.aggregate<{ _id: null; total: number }>([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
    ]);
    stats = {
      salons,
      pending,
      customers,
      owners,
      bookings,
      bookingsToday,
      reviews,
      revenue: revenueAgg[0]?.total ?? 0,
    };
  } catch {
    // zeros
  }

  return (
    <div className="space-y-6">
      {stats.pending > 0 && (
        <Link
          href="/admin/salons?status=pending"
          className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {stats.pending} salon{stats.pending > 1 ? "s" : ""} awaiting approval
          </span>
          <span>Review now →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Live salons" value={stats.salons} icon="store" />
        <StatCard label="Customers" value={stats.customers} icon="users" />
        <StatCard label="Salon owners" value={stats.owners} icon="users" />
        <StatCard
          label="Total bookings"
          value={stats.bookings}
          icon="calendar"
          hint={`${stats.bookingsToday} today`}
        />
        <StatCard label="Published reviews" value={stats.reviews} icon="star" />
        <StatCard
          label="Completed booking value"
          value={formatPKR(stats.revenue)}
          icon="wallet"
          hint="Gross value of completed appointments"
        />
      </div>
    </div>
  );
}
