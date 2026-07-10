import { connectDB } from "@/server/db";
import {
  SalonSubscription,
  SubscriptionInvoice,
  SubscriptionPayment,
  Salon,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanType,
  type PaymentStatus,
} from "@/server/models";
import { ApiError } from "@/server/api-helpers";
import { notify } from "./notification.service";
import { paymentGateway, type PaymentMethod, type PaymentInitResponse } from "@/server/payment";

function generateInvoiceNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SH-INV-${code}`;
}

// ── Trial Management ──────────────────────────────────────

/** Start a free trial for a newly approved salon (called from moderateSalon) */
export async function startFreeTrial(salonId: string) {
  await connectDB();

  const now = new Date();
  const trialEndDate = new Date(now);
  trialEndDate.setDate(trialEndDate.getDate() + SUBSCRIPTION_PLANS.trial.duration);

  const invoiceNumber = generateInvoiceNumber();

  const subscription = await SalonSubscription.create({
    salon: salonId,
    plan: "trial",
    status: "active",
    trialStartDate: now,
    trialEndDate,
    startDate: now,
    expiryDate: trialEndDate,
    amount: 0,
    paymentStatus: "paid",
    invoiceNumber,
  });

  // Create zero-amount invoice
  await SubscriptionInvoice.create({
    subscription: subscription._id,
    salon: salonId,
    invoiceNumber,
    amount: 0,
    status: "paid",
    paidAt: now,
    dueDate: now,
    items: [{ description: "Free Trial - 2 Months", amount: 0 }],
  });

  return subscription;
}

// ── Subscription Queries ──────────────────────────────────

/** Get the current subscription for a salon */
export async function getSalonSubscription(salonId: string) {
  await connectDB();
  return SalonSubscription.findOne({
    salon: salonId,
    status: { $in: ["active", "expired", "suspended"] },
  }).sort({ createdAt: -1 });
}

/** Check if a salon has an active subscription */
export async function isActiveSubscription(salonId: string): Promise<boolean> {
  const subscription = await getSalonSubscription(salonId);
  if (!subscription) return false;
  return subscription.status === "active" && subscription.expiryDate > new Date();
}

/** Get detailed subscription status for display */
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
  if (subscription.status === "suspended") {
    displayStatus = "suspended";
  } else if (isExpired) {
    displayStatus = "expired";
  } else if (subscription.plan === "trial") {
    displayStatus = "trial";
  } else if (subscription.plan === "premium") {
    displayStatus = "active_premium";
  } else {
    displayStatus = "active_basic";
  }

  return {
    status: displayStatus as any,
    subscription,
    daysRemaining,
    isExpired,
    canBook,
    features,
  };
}

// ── Subscription Upgrade/Purchase ─────────────────────────

/** Initiate a subscription upgrade (creates invoice, returns payment URL) */
export async function initiateSubscriptionUpgrade(
  salonId: string,
  plan: "basic" | "premium",
  paymentMethod: PaymentMethod
): Promise<{
  subscription: any;
  invoice: any;
  payment: PaymentInitResponse;
}> {
  await connectDB();

  const planConfig = SUBSCRIPTION_PLANS[plan];
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

  const invoiceNumber = generateInvoiceNumber();

  // Create subscription record
  const subscription = await SalonSubscription.create({
    salon: salonId,
    plan,
    status: "active",
    startDate: now,
    expiryDate,
    renewalDate: expiryDate,
    amount: planConfig.price,
    paymentStatus: "pending",
    paymentMethod,
    invoiceNumber,
  });

  // Create invoice
  const invoice = await SubscriptionInvoice.create({
    subscription: subscription._id,
    salon: salonId,
    invoiceNumber,
    amount: planConfig.price,
    status: "pending",
    dueDate: expiryDate,
    items: [
      {
        description: `GetSalons ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - Monthly`,
        amount: planConfig.price,
      },
    ],
  });

  // Get salon info for payment
  const salon = await Salon.findById(salonId).select("name email phone owner");

  // Initiate payment with gateway
  const gateway = paymentGateway(paymentMethod);
  const paymentResult = await gateway.initPayment({
    amount: planConfig.price,
    currency: "PKR",
    invoiceNumber,
    customerName: salon?.name || "Salon",
    customerEmail: salon?.email,
    customerPhone: salon?.phone || "+923000000000",
    description: `GetSalons ${plan} Plan - Rs.${planConfig.price}/month`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/salon-dashboard/subscription?payment=return&invoice=${invoiceNumber}`,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/webhook`,
    metadata: { salonId, plan, subscriptionId: subscription._id.toString() },
  });

  // Create payment record
  await SubscriptionPayment.create({
    subscription: subscription._id,
    salon: salonId,
    invoice: invoice._id,
    amount: planConfig.price,
    method: paymentMethod,
    status: paymentResult.success ? "pending" : "failed",
    transactionId: paymentResult.transactionId,
    gatewayResponse: paymentResult as any,
  });

  return { subscription, invoice, payment: paymentResult };
}

/** Complete subscription after successful payment (called from webhook) */
export async function completeSubscriptionPayment(
  invoiceNumber: string,
  transactionId: string,
  gatewayStatus: "paid" | "failed"
) {
  await connectDB();

  const invoice = await SubscriptionInvoice.findOne({ invoiceNumber });
  if (!invoice) throw new ApiError("Invoice not found.", 404);

  const subscription = await SalonSubscription.findById(invoice.subscription);
  if (!subscription) throw new ApiError("Subscription not found.", 404);

  if (gatewayStatus === "paid") {
    // Activate subscription
    subscription.paymentStatus = "paid";
    subscription.status = "active";
    await subscription.save();

    // Update invoice
    invoice.status = "paid";
    invoice.paidAt = new Date();
    await invoice.save();

    // Update payment record
    await SubscriptionPayment.findOneAndUpdate(
      { subscription: subscription._id, transactionId },
      { status: "paid" }
    );

    // Update salon features based on plan
    if (subscription.plan === "premium") {
      await Salon.updateOne(
        { _id: subscription.salon },
        { isPremium: true, isFeatured: true }
      );
    }

    // Notify
    await notify({
      userId: subscription.salon.toString(),
      type: "subscription_expiry",
      title: "Subscription Activated! 🎉",
      message: `Your ${subscription.plan} plan is now active until ${subscription.expiryDate.toLocaleDateString("en-PK")}.`,
      link: "/salon-dashboard/subscription",
    });
  } else {
    // Payment failed
    subscription.paymentStatus = "failed";
    await subscription.save();

    invoice.status = "failed";
    await invoice.save();

    await SubscriptionPayment.findOneAndUpdate(
      { subscription: subscription._id, transactionId },
      { status: "failed" }
    );
  }

  return subscription;
}

/** Direct upgrade (for demo/testing without real gateway) */
export async function directUpgradeSubscription(
  salonId: string,
  plan: "basic" | "premium"
) {
  await connectDB();

  const planConfig = SUBSCRIPTION_PLANS[plan];
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

  // Deactivate existing
  await SalonSubscription.updateMany(
    { salon: salonId, status: "active" },
    { status: "expired" }
  );

  const invoiceNumber = generateInvoiceNumber();

  const subscription = await SalonSubscription.create({
    salon: salonId,
    plan,
    status: "active",
    startDate: now,
    expiryDate,
    renewalDate: expiryDate,
    amount: planConfig.price,
    paymentStatus: "paid",
    paymentMethod: "direct",
    invoiceNumber,
  });

  await SubscriptionInvoice.create({
    subscription: subscription._id,
    salon: salonId,
    invoiceNumber,
    amount: planConfig.price,
    status: "paid",
    paidAt: now,
    dueDate: now,
    items: [{ description: `GetSalons ${plan} Plan - Monthly`, amount: planConfig.price }],
  });

  await SubscriptionPayment.create({
    subscription: subscription._id,
    salon: salonId,
    invoice: (await SubscriptionInvoice.findOne({ invoiceNumber }))!._id,
    amount: planConfig.price,
    method: "direct",
    status: "paid",
    transactionId: `DIRECT-${Date.now()}`,
  });

  if (plan === "premium") {
    await Salon.updateOne({ _id: salonId }, { isPremium: true, isFeatured: true });
  } else {
    await Salon.updateOne({ _id: salonId }, { isPremium: false });
  }

  await notify({
    userId: salonId,
    type: "subscription_expiry",
    title: "Subscription Activated! 🎉",
    message: `Your ${plan} plan is now active until ${expiryDate.toLocaleDateString("en-PK")}.`,
    link: "/salon-dashboard/subscription",
  });

  return subscription;
}

// ── Admin Actions ─────────────────────────────────────────

/** Extend trial period (admin action) */
export async function extendTrial(salonId: string, additionalDays: number) {
  await connectDB();

  const subscription = await SalonSubscription.findOne({
    salon: salonId,
    plan: "trial",
    status: "active",
  });

  if (!subscription) {
    throw new ApiError("No active trial found for this salon.", 404);
  }

  const newExpiryDate = new Date(subscription.expiryDate);
  newExpiryDate.setDate(newExpiryDate.getDate() + additionalDays);

  subscription.expiryDate = newExpiryDate;
  subscription.trialEndDate = newExpiryDate;
  await subscription.save();

  await notify({
    userId: salonId,
    type: "subscription_expiry",
    title: "Trial Extended",
    message: `Your free trial has been extended by ${additionalDays} days. New expiry: ${newExpiryDate.toLocaleDateString("en-PK")}.`,
    link: "/salon-dashboard/subscription",
  });

  return subscription;
}

/** Suspend a subscription (admin action) */
export async function suspendSubscription(salonId: string, reason?: string) {
  await connectDB();

  const subscription = await SalonSubscription.findOne({
    salon: salonId,
    status: "active",
  });

  if (!subscription) {
    throw new ApiError("No active subscription found.", 404);
  }

  subscription.status = "suspended";
  await subscription.save();

  if (subscription.plan === "premium") {
    await Salon.updateOne({ _id: salonId }, { isPremium: false, isFeatured: false });
  }

  await notify({
    userId: salonId,
    type: "subscription_expiry",
    title: "Subscription Suspended",
    message: reason || "Your subscription has been suspended. Please contact support.",
    link: "/salon-dashboard/subscription",
  });

  return subscription;
}

// ── Subscription Expiry Enforcement ───────────────────────

/** Check and expire overdue subscriptions, send expiry warnings */
export async function processSubscriptionExpiry() {
  await connectDB();
  const now = new Date();

  // 1. Expire overdue subscriptions
  const expired = await SalonSubscription.updateMany(
    { status: "active", expiryDate: { $lt: now } },
    { status: "expired" }
  );

  // Reset premium flags for expired premium subscriptions
  const expiredPremium = await SalonSubscription.find({
    status: "expired",
    plan: "premium",
  }).select("salon");

  if (expiredPremium.length > 0) {
    const salonIds = expiredPremium.map((s) => s.salon);
    await Salon.updateMany({ _id: { $in: salonIds } }, { isPremium: false, isFeatured: false });
  }

  // 2. Send expiry warnings at 14, 7, 3, 1 days
  const warningDays = [14, 7, 3, 1];
  for (const days of warningDays) {
    const warningDate = new Date(now);
    warningDate.setDate(warningDate.getDate() + days);

    const dayStart = new Date(warningDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(warningDate);
    dayEnd.setHours(23, 59, 59, 999);

    const subscriptions = await SalonSubscription.find({
      status: "active",
      plan: { $in: ["trial", "basic", "premium"] },
      expiryDate: { $gte: dayStart, $lte: dayEnd },
    }).select("salon plan expiryDate");

    for (const sub of subscriptions) {
      const planLabel = sub.plan === "trial" ? "free trial" : `${sub.plan} plan`;
      await notify({
        userId: sub.salon.toString(),
        type: "trial_expiry_warning",
        title: `Your ${planLabel} expires in ${days} day${days > 1 ? "s" : ""}`,
        message: `Your ${planLabel} expires on ${sub.expiryDate.toLocaleDateString("en-PK")}. ${sub.plan === "trial" ? "Upgrade to Basic or Premium to continue accepting bookings." : "Renew your subscription to avoid interruption."}`,
        link: "/salon-dashboard/subscription",
      });
    }
  }

  return { expired: expired.modifiedCount };
}

// ── Queries ───────────────────────────────────────────────

/** Get payment history for a salon */
export async function getPaymentHistory(salonId: string) {
  await connectDB();
  return SubscriptionPayment.find({ salon: salonId })
    .populate("invoice")
    .sort({ createdAt: -1 });
}

/** Get subscription analytics for admin */
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

  const revenue = await SubscriptionPayment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const monthlyRevenue = await SubscriptionPayment.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  return {
    total,
    active,
    expired,
    suspended,
    trial,
    basic,
    premium,
    totalRevenue: revenue[0]?.total || 0,
    monthlyRevenue,
  };
}

/** Get all subscriptions for admin with filters */
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
    // Search by salon name - need to find salon IDs first
    const { Salon } = await import("@/server/models");
    const salons = await Salon.find({
      name: new RegExp(params.search, "i"),
    }).select("_id");
    filter.salon = { $in: salons.map((s) => s._id) };
  }

  const [subscriptions, total] = await Promise.all([
    SalonSubscription.find(filter)
      .populate("salon", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SalonSubscription.countDocuments(filter),
  ]);

  return {
    subscriptions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
