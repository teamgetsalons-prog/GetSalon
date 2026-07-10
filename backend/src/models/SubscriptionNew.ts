import { Schema, model, models, type Model, type Types } from "mongoose";

export type SubscriptionPlanType = "trial" | "basic" | "premium";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "suspended";

export interface ISalonSubscription {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  plan: SubscriptionPlanType;
  status: SubscriptionStatus;
  trialStartDate?: Date;
  trialEndDate?: Date;
  startDate: Date;
  expiryDate: Date;
  renewalDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SalonSubscriptionSchema = new Schema<ISalonSubscription>(
  {
    salon: { type: Schema.Types.ObjectId, ref: "Salon", required: true, unique: true },
    plan: { type: String, enum: ["trial", "basic", "premium"], default: "trial" },
    status: { type: String, enum: ["active", "expired", "cancelled", "suspended"], default: "active" },
    trialStartDate: Date,
    trialEndDate: Date,
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    renewalDate: Date,
  },
  { timestamps: true }
);

SalonSubscriptionSchema.index({ salon: 1 });
SalonSubscriptionSchema.index({ expiryDate: 1, status: 1 });

export const SalonSubscription: Model<ISalonSubscription> =
  models.SalonSubscription || model("SalonSubscription", SalonSubscriptionSchema);

// ── Plan constants (free launch) ──

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlanType,
  { name: string; price: number; duration: number; features: string[] }
> = {
  trial: {
    name: "Free Trial",
    price: 0,
    duration: 60, // 2 months
    features: [
      "Unlimited bookings",
      "Complete appointment management",
      "Staff management",
      "Service management",
      "Gallery management",
      "Customer reviews",
      "WhatsApp button",
      "Analytics dashboard",
      "Business profile customization",
      "SEO-friendly salon page",
      "Booking history",
      "Email notifications",
    ],
  },
  basic: {
    name: "Basic",
    price: 500,
    duration: 30,
    features: [
      "Unlimited bookings",
      "Complete appointment management",
      "Staff management",
      "Service management",
      "Gallery management",
      "Customer reviews",
      "WhatsApp button",
      "Analytics dashboard",
      "Business profile customization",
      "SEO-friendly salon page",
      "Booking history",
      "Email notifications",
    ],
  },
  premium: {
    name: "Premium",
    price: 800,
    duration: 30,
    features: [
      "Everything in Basic",
      "Featured salon badge",
      "Priority placement in search results",
      "Homepage featured section eligibility",
      "Premium analytics",
      "Extra gallery capacity",
      "Promotional badge",
      "Priority customer support",
      "Future premium marketing tools",
    ],
  },
};
