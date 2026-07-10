import Link from "next/link";
import { Clock } from "lucide-react";
import { serverFetch } from "@/lib/server-api";
import { formatPKR } from "@getsalons/shared/utils";
import { StatCard } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

interface AdminStats {
  totalSalons: number;
  pendingSalons: number;
  totalCustomers: number;
  totalOwners: number;
  totalBookings: number;
  bookingsToday: number;
  totalReviews: number;
  completedRevenue: number;
}

const EMPTY_STATS: AdminStats = {
  totalSalons: 0,
  pendingSalons: 0,
  totalCustomers: 0,
  totalOwners: 0,
  totalBookings: 0,
  bookingsToday: 0,
  totalReviews: 0,
  completedRevenue: 0,
};

export default async function AdminOverviewPage() {
  const res = await serverFetch<AdminStats>("/admin/stats");
  const stats = res.success && res.data ? { ...EMPTY_STATS, ...res.data } : EMPTY_STATS;

  return (
    <div className="space-y-6">
      {stats.pendingSalons > 0 && (
        <Link
          href="/admin/salons"
          className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {stats.pendingSalons} salon{stats.pendingSalons > 1 ? "s" : ""} awaiting approval
          </span>
          <span>Review now →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Live salons" value={stats.totalSalons} icon="store" />
        <StatCard label="Customers" value={stats.totalCustomers} icon="users" />
        <StatCard label="Salon owners" value={stats.totalOwners} icon="users" />
        <StatCard
          label="Total bookings"
          value={stats.totalBookings}
          icon="calendar"
          hint={`${stats.bookingsToday} today`}
        />
        <StatCard label="Published reviews" value={stats.totalReviews} icon="star" />
        <StatCard
          label="Completed booking value"
          value={formatPKR(stats.completedRevenue)}
          icon="wallet"
          hint="Gross value of completed appointments"
        />
      </div>
    </div>
  );
}
