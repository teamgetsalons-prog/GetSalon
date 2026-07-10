import { Schema, model, models, type Model, type Types } from "mongoose";

export type SubscriptionPlanType = "trial" | "basic" | "premium";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "suspended";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";

export interface ISubscriptionPlan {
  _id: Types.ObjectId;
  name: string;
  slug: SubscriptionPlanType;
  price: number;
  currency: string;
  duration: number; // days
  features: {
    unlimitedBookings: boolean;
    appointmentManagement: boolean;
    staffManagement: boolean;
    serviceManagement: boolean;
    galleryManagement: boolean;
    customerReviews: boolean;
    whatsappButton: boolean;
    analyticsDashboard: boolean;
    businessProfileCustomization: boolean;
    seoFriendlyPage: boolean;
    bookingHistory: boolean;
    emailNotifications: boolean;
    featuredSalonBadge: boolean;
    priorityPlacement: boolean;
    homepageFeatured: boolean;
    premiumAnalytics: boolean;
    extraGalleryCapacity: boolean;
    promotionalBadge: boolean;
    prioritySupport: boolean;
    futurePremiumTools: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionInvoice {
  _id: Types.ObjectId;
  subscription: Types.ObjectId;
  salon: Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paidAt?: Date;
  dueDate: Date;
  items: {
    description: string;
    amount: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionPayment {
  _id: Types.ObjectId;
  subscription: Types.ObjectId;
  salon: Types.ObjectId;
  invoice: Types.ObjectId;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlanType,
  {
    price: number;
    duration: number;
    trialDays: number;
    features: ISubscriptionPlan["features"];
  }
> = {
  trial: {
    price: 0,
    duration: 60, // 2 months
    trialDays: 60,
    features: {
      unlimitedBookings: true,
      appointmentManagement: true,
      staffManagement: true,
      serviceManagement: true,
      galleryManagement: true,
      customerReviews: true,
      whatsappButton: true,
      analyticsDashboard: true,
      businessProfileCustomization: true,
      seoFriendlyPage: true,
      bookingHistory: true,
      emailNotifications: true,
      featuredSalonBadge: false,
      priorityPlacement: false,
      homepageFeatured: false,
      premiumAnalytics: false,
      extraGalleryCapacity: false,
      promotionalBadge: false,
      prioritySupport: false,
      futurePremiumTools: false,
    },
  },
  basic: {
    price: 500,
    duration: 30,
    trialDays: 0,
    features: {
      unlimitedBookings: true,
      appointmentManagement: true,
      staffManagement: true,
      serviceManagement: true,
      galleryManagement: true,
      customerReviews: true,
      whatsappButton: true,
      analyticsDashboard: true,
      businessProfileCustomization: true,
      seoFriendlyPage: true,
      bookingHistory: true,
      emailNotifications: true,
      featuredSalonBadge: false,
      priorityPlacement: false,
      homepageFeatured: false,
      premiumAnalytics: false,
      extraGalleryCapacity: false,
      promotionalBadge: false,
      prioritySupport: false,
      futurePremiumTools: false,
    },
  },
  premium: {
    price: 800,
    duration: 30,
    trialDays: 0,
    features: {
      unlimitedBookings: true,
      appointmentManagement: true,
      staffManagement: true,
      serviceManagement: true,
      galleryManagement: true,
      customerReviews: true,
      whatsappButton: true,
      analyticsDashboard: true,
      businessProfileCustomization: true,
      seoFriendlyPage: true,
      bookingHistory: true,
      emailNotifications: true,
      featuredSalonBadge: true,
      priorityPlacement: true,
      homepageFeatured: true,
      premiumAnalytics: true,
      extraGalleryCapacity: true,
      promotionalBadge: true,
      prioritySupport: true,
      futurePremiumTools: true,
    },
  },
};

// Subscription Plan Schema
const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    slug: {
      type: String,
      enum: ["trial", "basic", "premium"],
      required: true,
      unique: true,
    },
    price: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    duration: { type: Number, required: true },
    features: {
      unlimitedBookings: { type: Boolean, default: false },
      appointmentManagement: { type: Boolean, default: false },
      staffManagement: { type: Boolean, default: false },
      serviceManagement: { type: Boolean, default: false },
      galleryManagement: { type: Boolean, default: false },
      customerReviews: { type: Boolean, default: false },
      whatsappButton: { type: Boolean, default: false },
      analyticsDashboard: { type: Boolean, default: false },
      businessProfileCustomization: { type: Boolean, default: false },
      seoFriendlyPage: { type: Boolean, default: false },
      bookingHistory: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: false },
      featuredSalonBadge: { type: Boolean, default: false },
      priorityPlacement: { type: Boolean, default: false },
      homepageFeatured: { type: Boolean, default: false },
      premiumAnalytics: { type: Boolean, default: false },
      extraGalleryCapacity: { type: Boolean, default: false },
      promotionalBadge: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      futurePremiumTools: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Salon Subscription Schema
const salonSubscriptionSchema = new Schema<ISalonSubscription>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["trial", "basic", "premium"],
      default: "trial",
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "suspended"],
      default: "active",
      index: true,
    },
    trialStartDate: Date,
    trialEndDate: Date,
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    renewalDate: Date,
    amount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentMethod: String,
    invoiceNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

salonSubscriptionSchema.index({ salon: 1, status: 1 });
salonSubscriptionSchema.index({ expiryDate: 1 });

// Subscription Invoice Schema
const subscriptionInvoiceSchema = new Schema<ISubscriptionInvoice>(
  {
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "SalonSubscription",
      required: true,
    },
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentMethod: String,
    paidAt: Date,
    dueDate: { type: Date, required: true },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

subscriptionInvoiceSchema.index({ salon: 1, createdAt: -1 });

// Subscription Payment Schema
const subscriptionPaymentSchema = new Schema<ISubscriptionPayment>(
  {
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "SalonSubscription",
      required: true,
    },
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionInvoice",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    transactionId: String,
    gatewayResponse: Schema.Types.Mixed,
  },
  { timestamps: true }
);

subscriptionPaymentSchema.index({ salon: 1, createdAt: -1 });

export const SubscriptionPlan: Model<ISubscriptionPlan> =
  (models.SubscriptionPlan as Model<ISubscriptionPlan>) ||
  model<ISubscriptionPlan>("SubscriptionPlan", subscriptionPlanSchema);

export const SalonSubscription: Model<ISalonSubscription> =
  (models.SalonSubscription as Model<ISalonSubscription>) ||
  model<ISalonSubscription>("SalonSubscription", salonSubscriptionSchema);

export const SubscriptionInvoice: Model<ISubscriptionInvoice> =
  (models.SubscriptionInvoice as Model<ISubscriptionInvoice>) ||
  model<ISubscriptionInvoice>("SubscriptionInvoice", subscriptionInvoiceSchema);

export const SubscriptionPayment: Model<ISubscriptionPayment> =
  (models.SubscriptionPayment as Model<ISubscriptionPayment>) ||
  model<ISubscriptionPayment>("SubscriptionPayment", subscriptionPaymentSchema);
