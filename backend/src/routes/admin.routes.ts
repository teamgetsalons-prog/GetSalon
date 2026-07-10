import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { User, Salon, Appointment, Review, AuditLog } from "../models/index.js";
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
import {
  getAllSubscriptions,
  extendTrial,
  suspendSubscription,
  getSubscriptionAnalytics,
  upgradeSubscription,
} from "../services/subscription.service.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("admin"));

router.get("/stats", async (_req: Request, res: Response) => {
  const today = toDateKey(new Date());
  const monthStart = today.slice(0, 8) + "01";

  const [
    totalSalons, pendingSalons, totalCustomers, totalOwners,
    totalBookings, bookingsToday, bookingsThisMonth,
    completedBookings, totalReviews, revenueAgg,
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
    Appointment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]),
  ]);

  return ok(res, {
    totalSalons, pendingSalons, totalCustomers, totalOwners,
    totalBookings, bookingsToday, bookingsThisMonth,
    completedBookings, totalReviews,
    completedRevenue: revenueAgg[0]?.total ?? 0,
  });
});

router.get("/salons", async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const status = req.query.status as string | undefined;
  const q = req.query.q as string | undefined;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { cityName: rx }, { phone: rx }];
  }

  const [salons, total] = await Promise.all([
    Salon.find(filter)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Salon.countDocuments(filter),
  ]);

  return ok(res, salons, {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

router.post("/salons/:id/moderate", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, reason } = req.body;

  const validActions = ["approve", "reject", "suspend", "feature", "unfeature"];
  if (!validActions.includes(action)) return fail(res, "Invalid action.", 400);

  const salon = await Salon.findById(id);
  if (!salon) return fail(res, "Salon not found.", 404);

  if (action === "approve") salon.status = "approved";
  else if (action === "reject") salon.status = "rejected";
  else if (action === "suspend") salon.status = "suspended";
  else if (action === "feature") salon.isFeatured = true;
  else if (action === "unfeature") salon.isFeatured = false;

  await salon.save();

  await AuditLog.create({
    actor: req.user!.id,
    actorRole: "admin",
    action: `salon.${action}`,
    entity: "Salon",
    entityId: id,
    reason,
  });

  return ok(res, { id: salon._id.toString(), status: salon.status, isFeatured: salon.isFeatured });
});

router.get("/users", async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const role = req.query.role as string | undefined;
  const q = req.query.q as string | undefined;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email phone role isActive city createdAt lastLoginAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return ok(res, users, {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

router.patch("/users", async (req: Request, res: Response) => {
  const { userId, isActive } = req.body;
  if (!userId || typeof isActive !== "boolean") {
    return fail(res, "userId and isActive are required.", 400);
  }

  const user = await User.findById(userId);
  if (!user) return fail(res, "User not found.", 404);

  user.isActive = isActive;
  await user.save();

  await AuditLog.create({
    actor: req.user!.id,
    actorRole: "admin",
    action: isActive ? "user.activate" : "user.deactivate",
    entity: "User",
    entityId: userId,
  });

  return ok(res, { id: user._id.toString(), isActive: user.isActive });
});

router.get("/subscriptions", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const plan = req.query.plan as string | undefined;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const analytics = req.query.analytics === "true";

  if (analytics) {
    const data = await getSubscriptionAnalytics();
    return ok(res, data);
  }

  const result = await getAllSubscriptions({ page, limit, plan, status, search });
  return ok(res, result);
});

router.patch("/subscriptions", async (req: Request, res: Response) => {
  const body = req.body;

  if (body.salonId && body.additionalDays) {
    const result = await extendTrial(body.salonId, body.additionalDays);
    return ok(res, result, { message: `Trial extended by ${body.additionalDays} days` });
  }

  if (body.salonId && body.reason !== undefined) {
    const result = await suspendSubscription(body.salonId, body.reason);
    return ok(res, result, { message: "Subscription suspended" });
  }

  if (body.salonId && body.plan) {
    const result = await upgradeSubscription(body.salonId, body.plan);
    return ok(res, result, { message: `Upgraded to ${body.plan}` });
  }

  return fail(res, "Invalid action", 400);
});

export { router as adminRoutes };
export default router;
