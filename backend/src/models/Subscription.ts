import { Schema, model, models, type Model, type Types } from "mongoose";
import type { SubscriptionPlan } from "../../../shared/src/types.js";

export interface ISubscription {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  plan: SubscriptionPlan;
  status: "active" | "expired" | "cancelled";
  startsAt: Date;
  expiresAt?: Date;
  price: number;
  features: {
    maxStaff: number;
    maxGalleryImages: number;
    maxServices: number;
    featuredListing: boolean;
    prioritySearch: boolean;
    analytics: boolean;
    whatsappIntegration: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const PLAN_FEATURES: Record<
  SubscriptionPlan,
  ISubscription["features"] & { price: number }
> = {
  free: {
    price: 0,
    maxStaff: 3,
    maxGalleryImages: 10,
    maxServices: 15,
    featuredListing: false,
    prioritySearch: false,
    analytics: false,
    whatsappIntegration: false,
  },
  premium: {
    price: 2500,
    maxStaff: 10,
    maxGalleryImages: 40,
    maxServices: 60,
    featuredListing: true,
    prioritySearch: true,
    analytics: true,
    whatsappIntegration: false,
  },
  business: {
    price: 6000,
    maxStaff: 100,
    maxGalleryImages: 200,
    maxServices: 500,
    featuredListing: true,
    prioritySearch: true,
    analytics: true,
    whatsappIntegration: true,
  },
};

const subscriptionSchema = new Schema<ISubscription>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "premium", "business"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    startsAt: { type: Date, default: Date.now },
    expiresAt: Date,
    price: { type: Number, default: 0 },
    features: {
      maxStaff: { type: Number, default: 3 },
      maxGalleryImages: { type: Number, default: 10 },
      maxServices: { type: Number, default: 15 },
      featuredListing: { type: Boolean, default: false },
      prioritySearch: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      whatsappIntegration: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> =
  (models.Subscription as Model<ISubscription>) ||
  model<ISubscription>("Subscription", subscriptionSchema);
