import { connectDB } from "../db.js";
import { Salon, Appointment, Review, User } from "../models/index.js";

export interface SalonAnalytics {
  profileViews: number;
  bookingRequests: number;
  completedBookings: number;
  phoneClicks: number;
  whatsappClicks: number;
  reviewCount: number;
  averageRating: number;
  revenue: number;
  subscriptionStatus: string;
}

/** Get analytics for a specific salon */
export async function getSalonAnalytics(salonId: string): Promise<SalonAnalytics> {
  await connectDB();

  const salon = await Salon.findById(salonId).select("views rating analytics");
  if (!salon) {
    return {
      profileViews: 0,
      bookingRequests: 0,
      completedBookings: 0,
      phoneClicks: 0,
      whatsappClicks: 0,
      reviewCount: 0,
      averageRating: 0,
      revenue: 0,
      subscriptionStatus: "none",
    };
  }

  const [bookingStats, revenueStats] = await Promise.all([
    Appointment.aggregate([
      { $match: { salon: salon._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    Appointment.aggregate([
      { $match: { salon: salon._id, status: "completed" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]),
  ]);

  const stats = bookingStats.reduce(
    (acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    profileViews: salon.views || 0,
    bookingRequests: (stats.pending || 0) + (stats.confirmed || 0),
    completedBookings: stats.completed || 0,
    phoneClicks: (salon as any).analytics?.phoneClicks || 0,
    whatsappClicks: (salon as any).analytics?.whatsappClicks || 0,
    reviewCount: salon.rating?.count || 0,
    averageRating: salon.rating?.average || 0,
    revenue: revenueStats[0]?.total || 0,
    subscriptionStatus: "active",
  };
}

/** Track profile view */
export async function trackProfileView(salonId: string) {
  await connectDB();
  await Salon.updateOne({ _id: salonId }, { $inc: { views: 1 } });
}

/** Track phone click */
export async function trackPhoneClick(salonId: string) {
  await connectDB();
  await Salon.updateOne(
    { _id: salonId },
    { $inc: { "analytics.phoneClicks": 1 } }
  );
}

/** Track WhatsApp click */
export async function trackWhatsAppClick(salonId: string) {
  await connectDB();
  await Salon.updateOne(
    { _id: salonId },
    { $inc: { "analytics.whatsappClicks": 1 } }
  );
}

/** Get platform-wide analytics for admin */
export async function getPlatformAnalytics() {
  await connectDB();

  const [salons, customers, appointments, reviews] = await Promise.all([
    Salon.countDocuments({ status: "approved" }),
    User.countDocuments({ role: "customer" }),
    Appointment.countDocuments({}),
    Review.countDocuments({ status: "published" }),
  ]);

  const revenue = await Appointment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const monthlyBookings = await Appointment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  return {
    salons,
    customers,
    appointments,
    reviews,
    totalRevenue: revenue[0]?.total || 0,
    monthlyBookings,
  };
}
