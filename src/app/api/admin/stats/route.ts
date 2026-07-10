import { connectDB } from "@/server/db";
import {
  Appointment,
  Review,
  Salon,
  User,
} from "@/server/models";
import { handleApiError, ok, requireRole } from "@/server/api-helpers";
import { toDateKey } from "@/lib/utils";

/** GET /api/admin/stats — platform analytics for the admin dashboard */
export async function GET() {
  try {
    await requireRole("admin");
    await connectDB();

    const today = toDateKey(new Date());
    const monthStart = today.slice(0, 8) + "01";

    const [
      totalSalons,
      pendingSalons,
      totalCustomers,
      totalOwners,
      totalBookings,
      bookingsToday,
      bookingsThisMonth,
      completedBookings,
      totalReviews,
      revenueAgg,
    ] = await Promise.all([
      Salon.countDocuments({ status: "approved" }),
      Salon.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "owner" }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ date: today }),
      Appointment.countDocuments({ date: { $gte: monthStart } }),
      Appointment.countDocuments({ status: "completed" }),
      Review.countDocuments({ status: "published" }),
      Appointment.aggregate<{ _id: null; total: number }>([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
    ]);

    return ok({
      totalSalons,
      pendingSalons,
      totalCustomers,
      totalOwners,
      totalBookings,
      bookingsToday,
      bookingsThisMonth,
      completedBookings,
      totalReviews,
      completedRevenue: revenueAgg[0]?.total ?? 0,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
