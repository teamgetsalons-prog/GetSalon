import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { User, Salon, Appointment, Review, AuditLog, Service, Staff, Comment, SalonSubscription, City, SupportMessage } from "../models/index.js";
import { notify } from "../services/notification.service.js";
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

// Hard delete: removes the salon and everything attached to it. The
// softer tool (suspend) exists on the moderate endpoint; this is for
// spam/duplicate listings that should leave no trace.
router.delete("/salons/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const salon = await Salon.findById(id);
  if (!salon) return fail(res, "Salon not found.", 404);

  await Promise.all([
    Service.deleteMany({ salon: salon._id }),
    Staff.deleteMany({ salon: salon._id }),
    Appointment.deleteMany({ salon: salon._id }),
    Review.deleteMany({ salon: salon._id }),
    Comment.deleteMany({ salon: salon._id }),
    SalonSubscription.deleteMany({ salon: salon._id }),
    User.updateOne({ _id: salon.owner }, { $unset: { salon: 1 } }),
  ]);
  if (salon.status === "approved") {
    await City.updateOne({ _id: salon.city }, { $inc: { salonCount: -1 } });
  }
  await Salon.deleteOne({ _id: salon._id });

  await AuditLog.create({
    actor: req.user!.id,
    actorRole: "admin",
    action: "salon.delete",
    entity: "Salon",
    entityId: id,
  });

  return ok(res, { deleted: true });
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
  const { userId, isActive, role } = req.body;
  if (!userId || (typeof isActive !== "boolean" && role === undefined)) {
    return fail(res, "userId plus isActive and/or role are required.", 400);
  }
  if (role !== undefined && !["customer", "owner", "staff", "admin"].includes(role)) {
    return fail(res, "Invalid role.", 400);
  }

  const user = await User.findById(userId);
  if (!user) return fail(res, "User not found.", 404);

  // An admin must never be able to lock themselves out by accident.
  if (user._id.toString() === req.user!.id && (isActive === false || (role !== undefined && role !== "admin"))) {
    return fail(res, "You cannot deactivate or demote your own account.", 400);
  }

  const actions: string[] = [];
  if (typeof isActive === "boolean") {
    user.isActive = isActive;
    actions.push(isActive ? "user.activate" : "user.deactivate");
  }
  if (role !== undefined && role !== user.role) {
    user.role = role;
    actions.push(`user.role:${role}`);
  }
  await user.save();

  for (const action of actions) {
    await AuditLog.create({
      actor: req.user!.id,
      actorRole: "admin",
      action,
      entity: "User",
      entityId: userId,
    });
  }

  return ok(res, { id: user._id.toString(), isActive: user.isActive, role: user.role });
});

// Hard delete user
router.delete("/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return fail(res, "User not found.", 404);
  if (user._id.toString() === req.user!.id) {
    return fail(res, "You cannot delete your own account.", 400);
  }
  if (user.role === "admin") {
    return fail(res, "Cannot delete an admin account.", 400);
  }
  if (user.salon) {
    const salon = await Salon.findById(user.salon);
    if (salon) {
      await Promise.all([
        Service.deleteMany({ salon: salon._id }),
        Staff.deleteMany({ salon: salon._id }),
        Appointment.deleteMany({ salon: salon._id }),
        Review.deleteMany({ salon: salon._id }),
        Comment.deleteMany({ salon: salon._id }),
        SalonSubscription.deleteMany({ salon: salon._id }),
      ]);
      if (salon.status === "approved") {
        await City.updateOne({ _id: salon.city }, { $inc: { salonCount: -1 } });
      }
      await Salon.deleteOne({ _id: salon._id });
    }
  }
  await User.deleteOne({ _id: user._id });
  await AuditLog.create({
    actor: req.user!.id,
    actorRole: "admin",
    action: "user.delete",
    entity: "User",
    entityId: id,
  });
  return ok(res, { deleted: true });
});

// Delete support message
router.delete("/support/:id", async (req: Request, res: Response) => {
  const doc = await SupportMessage.findById(req.params.id);
  if (!doc) return fail(res, "Message not found.", 404);
  await SupportMessage.deleteOne({ _id: doc._id });
  return ok(res, { deleted: true });
});

// ── Support inbox ──

router.get("/support", async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const filter: Record<string, unknown> = {};
  if (status === "open" || status === "resolved") filter.status = status;
  const messages = await SupportMessage.find(filter)
    .populate("from", "name email phone role")
    .populate("salon", "name slug")
    .sort({ status: 1, createdAt: -1 })
    .limit(100);
  return ok(res, messages);
});

router.patch("/support/:id", async (req: Request, res: Response) => {
  const { reply, status } = req.body;
  const doc = await SupportMessage.findById(req.params.id);
  if (!doc) return fail(res, "Message not found.", 404);

  if (typeof reply === "string" && reply.trim()) {
    doc.reply = reply.trim().slice(0, 3000);
    doc.repliedAt = new Date();
    doc.replySeen = false;
  }
  if (status === "open" || status === "resolved") doc.status = status;
  await doc.save();

  if (doc.reply && doc.from) {
    await notify({
      userId: doc.from.toString(),
      type: "support_reply",
      title: "Support replied to your message",
      message: doc.reply.slice(0, 120),
      link: "/salon-dashboard/support",
    });
  }

  return ok(res, doc.toJSON());
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
