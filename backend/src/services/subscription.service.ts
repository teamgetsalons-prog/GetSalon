import { connectDB } from "../db.js";
import { SalonSubscription, Salon, SUBSCRIPTION_PLANS, type SubscriptionPlanType } from "../models/index.js";
import { ApiError, ok, fail } from "../middleware/error-handler.js";
import { notify } from "./notification.service.js";

function generateInvoiceNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `SH-INV-${code}`;
}

// ── Trial Management ──

export async function startFreeTrial(salonId: string) {
  await connectDB();
  const now = new Date();
  const trialEndDate = new Date(now);
  trialEndDate.setDate(trialEndDate.getDate() + SUBSCRIPTION_PLANS.trial.duration);

  const subscription = await SalonSubscription.create({
    salon: salonId,
    plan: "trial",
    status: "active",
    trialStartDate: now,
    trialEndDate,
    startDate: now,
    expiryDate: trialEndDate,
  });

  return subscription;
}

// ── Subscription Queries ──

export async function getSalonSubscription(salonId: string) {
  await connectDB();
  return SalonSubscription.findOne({
    salon: salonId,
    status: { $in: ["active", "expired", "suspended"] },
  }).sort({ createdAt: -1 });
}

export async function isActiveSubscription(salonId: string): Promise<boolean> {
  const subscription = await getSalonSubscription(salonId);
  if (!subscription) return false;
  return subscription.status === "active" && subscription.expiryDate > new Date();
}

export async function getSubscriptionStatus(salonId: string) {
  await connectDB();
  const subscription = await getSalonSubscription(salonId);

  if (!subscription) {
    return {
      status: "none" as const,
      subscription: null,
      daysRemaining: 0,
      isExpired: false,
      canBook: false,
      features: SUBSCRIPTION_PLANS.trial.features,
    };
  }

  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((subscription.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const isExpired = daysRemaining <= 0 || subscription.status === "expired";
  const canBook = subscription.status === "active" && !isExpired;
  const features = SUBSCRIPTION_PLANS[subscription.plan]?.features || SUBSCRIPTION_PLANS.trial.features;

  let displayStatus: string;
  if (subscription.status === "suspended") displayStatus = "suspended";
  else if (isExpired) displayStatus = "expired";
  else if (subscription.plan === "trial") displayStatus = "trial";
  else if (subscription.plan === "premium") displayStatus = "active_premium";
  else displayStatus = "active_basic";

  return { status: displayStatus as any, subscription, daysRemaining, isExpired, canBook, features };
}

// ── Subscription Upgrade (Demo/Free) ──

export async function upgradeSubscription(salonId: string, plan: "basic" | "premium") {
  await connectDB();
  const planConfig = SUBSCRIPTION_PLANS[plan];
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

  // One subscription document per salon (the salon field is unique) -
  // an upgrade replaces the current plan in place rather than creating
  // a history document, which would violate that index.
  const subscription = await SalonSubscription.findOneAndUpdate(
    { salon: salonId },
    {
      $set: {
        plan,
        status: "active",
        startDate: now,
        expiryDate,
        renewalDate: expiryDate,
      },
    },
    { upsert: true, new: true }
  );

  if (plan === "premium") {
    await Salon.updateOne({ _id: salonId }, { isPremium: true, isFeatured: true });
  } else {
    await Salon.updateOne({ _id: salonId }, { isPremium: false });
  }

  await notify({
    userId: salonId,
    type: "subscription_expiry",
    title: "Subscription Activated!",
    message: `Your ${plan} plan is now active until ${expiryDate.toLocaleDateString("en-PK")}.`,
    link: "/salon-dashboard/subscription",
  });

  return subscription;
}

// ── Admin Actions ──

export async function extendTrial(salonId: string, additionalDays: number) {
  await connectDB();
  const subscription = await SalonSubscription.findOne({ salon: salonId, plan: "trial", status: "active" });
  if (!subscription) throw new ApiError("No active trial found.", 404);

  const newExpiry = new Date(subscription.expiryDate);
  newExpiry.setDate(newExpiry.getDate() + additionalDays);
  subscription.expiryDate = newExpiry;
  subscription.trialEndDate = newExpiry;
  await subscription.save();

  await notify({
    userId: salonId,
    type: "subscription_expiry",
    title: "Trial Extended",
    message: `Your free trial extended by ${additionalDays} days.`,
    link: "/salon-dashboard/subscription",
  });

  return subscription;
}

export async function suspendSubscription(salonId: string, reason?: string) {
  await connectDB();
  const subscription = await SalonSubscription.findOne({ salon: salonId, status: "active" });
  if (!subscription) throw new ApiError("No active subscription.", 404);

  subscription.status = "suspended";
  await subscription.save();

  if (subscription.plan === "premium") {
    await Salon.updateOne({ _id: salonId }, { isPremium: false, isFeatured: false });
  }

  return subscription;
}

// ── Subscription Expiry Enforcement ──

export async function processSubscriptionExpiry() {
  await connectDB();
  const now = new Date();

  const expired = await SalonSubscription.updateMany(
    { status: "active", expiryDate: { $lt: now } },
    { status: "expired" }
  );

  // Reset premium flags
  const expiredPremium = await SalonSubscription.find({ status: "expired", plan: "premium" }).select("salon");
  if (expiredPremium.length > 0) {
    const salonIds = expiredPremium.map((s) => s.salon);
    await Salon.updateMany({ _id: { $in: salonIds } }, { isPremium: false, isFeatured: false });
  }

  // Send expiry warnings at 14, 7, 3, 1 days
  for (const days of [14, 7, 3, 1]) {
    const warningDate = new Date(now);
    warningDate.setDate(warningDate.getDate() + days);
    const dayStart = new Date(warningDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(warningDate); dayEnd.setHours(23, 59, 59, 999);

    const subscriptions = await SalonSubscription.find({
      status: "active",
      expiryDate: { $gte: dayStart, $lte: dayEnd },
    }).select("salon plan expiryDate");

    for (const sub of subscriptions) {
      const planLabel = sub.plan === "trial" ? "free trial" : `${sub.plan} plan`;
      await notify({
        userId: sub.salon.toString(),
        type: "trial_expiry_warning",
        title: `Your ${planLabel} expires in ${days} day${days > 1 ? "s" : ""}`,
        message: `Your ${planLabel} expires on ${sub.expiryDate.toLocaleDateString("en-PK")}.`,
        link: "/salon-dashboard/subscription",
      });
    }
  }

  return { expired: expired.modifiedCount };
}

// ── Queries ──

export async function getSubscriptionAnalytics() {
  await connectDB();
  const [total, active, expired, suspended, trial, basic, premium] = await Promise.all([
    SalonSubscription.countDocuments({}),
    SalonSubscription.countDocuments({ status: "active" }),
    SalonSubscription.countDocuments({ status: "expired" }),
    SalonSubscription.countDocuments({ status: "suspended" }),
    SalonSubscription.countDocuments({ plan: "trial", status: "active" }),
    SalonSubscription.countDocuments({ plan: "basic", status: "active" }),
    SalonSubscription.countDocuments({ plan: "premium", status: "active" }),
  ]);

  return { total, active, expired, suspended, trial, basic, premium, totalRevenue: 0 };
}

export async function getAllSubscriptions(params: {
  page?: number;
  limit?: number;
  plan?: string;
  status?: string;
  search?: string;
}) {
  await connectDB();
  const page = params.page || 1;
  const limit = Math.min(50, params.limit || 20);
  const filter: Record<string, unknown> = {};
  if (params.plan) filter.plan = params.plan;
  if (params.status) filter.status = params.status;

  if (params.search) {
    const { Salon } = await import("../models/index.js");
    const rx = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const salons = await Salon.find({ name: rx }).select("_id");
    filter.salon = { $in: salons.map((s) => s._id) };
  }

  const [subscriptions, total] = await Promise.all([
    SalonSubscription.find(filter).populate("salon", "name slug").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    SalonSubscription.countDocuments(filter),
  ]);

  return { subscriptions, total, page, totalPages: Math.ceil(total / limit) };
}
