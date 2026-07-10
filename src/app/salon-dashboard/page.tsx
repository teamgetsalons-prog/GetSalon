import { BadgeCheck } from "lucide-react";
import { auth } from "@/server/auth";
import { connectDB } from "@/server/db";
import { Appointment } from "@/server/models";
import { getActorSalon } from "@/server/services/salon.service";
import { formatPKR, toDateKey } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/shell";
import { BookingList } from "@/components/dashboard/booking-list";
import { NoSalonYet } from "@/components/dashboard/no-salon";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SalonOverviewPage() {
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

  const today = toDateKey(new Date());
  const monthStart = today.slice(0, 8) + "01";

  let stats = { today: 0, pending: 0, monthRevenue: 0 };
  try {
    const [todayCount, pendingCount, revenueAgg] = await Promise.all([
      Appointment.countDocuments({
        salon: salon._id,
        date: today,
        status: { $in: ["pending", "confirmed"] },
      }),
      Appointment.countDocuments({ salon: salon._id, status: "pending" }),
      Appointment.aggregate<{ _id: null; total: number }>([
        {
          $match: {
            salon: salon._id,
            status: "completed",
            date: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
    ]);
    stats = {
      today: todayCount,
      pending: pendingCount,
      monthRevenue: revenueAgg[0]?.total ?? 0,
    };
  } catch {
    // keep zeros
  }

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-5">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            {salon.name}
            {salon.isVerified && <BadgeCheck className="h-4.5 w-4.5 text-gold" />}
          </p>
          <p className="mt-0.5 text-xs text-fg-muted">
            {salon.areaName ? `${salon.areaName}, ` : ""}
            {salon.cityName}
          </p>
        </div>
        {salon.status === "approved" ? (
          <Badge variant="success">Live on GetSalons</Badge>
        ) : salon.status === "pending" ? (
          <Badge variant="warning">Awaiting approval</Badge>
        ) : (
          <Badge variant="danger">
            {salon.status === "rejected" ? "Rejected" : "Suspended"}
          </Badge>
        )}
      </div>

      {salon.status === "rejected" && salon.rejectionReason && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          Rejection reason: {salon.rejectionReason} — update your profile and
          contact support to re-submit.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today's bookings" value={stats.today} icon="calendar" />
        <StatCard
          label="Pending requests"
          value={stats.pending}
          icon="calendar"
          hint="Confirm them quickly!"
        />
        <StatCard
          label="Revenue (month)"
          value={formatPKR(stats.monthRevenue)}
          icon="wallet"
          hint="Completed bookings"
        />
        <StatCard
          label="Rating"
          value={
            salon.rating.count > 0
              ? `${salon.rating.average.toFixed(1)} ★`
              : "—"
          }
          icon="star"
          hint={`${salon.rating.count} reviews · ${salon.views} profile views`}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent bookings</h2>
        <BookingList role="salon" />
      </div>
    </div>
  );
}
