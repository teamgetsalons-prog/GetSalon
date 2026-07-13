import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { ok } from "../middleware/error-handler.js";
import { Appointment, Salon, SupportMessage } from "../models/index.js";
import { toDateKey } from "../../../shared/dist/utils.js";
import { getActorSalon } from "../services/salon.service.js";

const router = Router();

/**
 * Role-aware attention counts for the panel navigation, keyed by the
 * nav href they belong to - the dashboard shell shows them as pills.
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  const user = req.user!;
  const today = toDateKey(new Date());
  const badges: Record<string, number> = {};

  if (user.role === "admin") {
    const [pendingSalons, openSupport] = await Promise.all([
      Salon.countDocuments({ status: "pending" }),
      SupportMessage.countDocuments({ status: "open" }),
    ]);
    if (pendingSalons) badges["/admin/salons"] = pendingSalons;
    if (openSupport) badges["/admin/support"] = openSupport;
  } else if (user.role === "owner" || user.role === "staff") {
    const salon = await getActorSalon(user);
    const [pendingBookings, unreadReplies] = await Promise.all([
      salon
        ? Appointment.countDocuments({
            salon: salon._id,
            status: "pending",
            date: { $gte: today },
          })
        : 0,
      SupportMessage.countDocuments({ from: user.id, replySeen: false }),
    ]);
    if (pendingBookings) badges["/salon-dashboard/bookings"] = pendingBookings;
    if (unreadReplies) badges["/salon-dashboard/support"] = unreadReplies;
  } else {
    const upcoming = await Appointment.countDocuments({
      customer: user.id,
      status: { $in: ["pending", "confirmed"] },
      date: { $gte: today },
    });
    if (upcoming) badges["/dashboard/bookings"] = upcoming;
  }

  return ok(res, badges);
});

export { router as badgeRoutes };
export default router;
