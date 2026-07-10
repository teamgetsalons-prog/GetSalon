import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface ILoyaltyAccount {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  totalPoints: number;
  earnedPoints: number;
  redeemedPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoyaltyTransaction {
  _id: Types.ObjectId;
  account: Types.ObjectId;
  customer: Types.ObjectId;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  points: number;
  description: string;
  appointment?: Types.ObjectId;
  salon?: Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
}

const loyaltyAccountSchema = new Schema<ILoyaltyAccount>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalPoints: { type: Number, default: 0 },
    earnedPoints: { type: Number, default: 0 },
    redeemedPoints: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
  },
  { timestamps: true }
);

const loyaltyTransactionSchema = new Schema<ILoyaltyTransaction>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "LoyaltyAccount",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["earned", "redeemed", "expired", "adjusted"],
      required: true,
    },
    points: { type: Number, required: true },
    description: { type: String, required: true },
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
    salon: { type: Schema.Types.ObjectId, ref: "Salon" },
    expiresAt: Date,
  },
  { timestamps: true }
);

loyaltyTransactionSchema.index({ customer: 1, createdAt: -1 });

export const LoyaltyAccount: Model<ILoyaltyAccount> =
  (models.LoyaltyAccount as Model<ILoyaltyAccount>) ||
  model<ILoyaltyAccount>("LoyaltyAccount", loyaltyAccountSchema);

export const LoyaltyTransaction: Model<ILoyaltyTransaction> =
  (models.LoyaltyTransaction as Model<ILoyaltyTransaction>) ||
  model<ILoyaltyTransaction>("LoyaltyTransaction", loyaltyTransactionSchema);

// Points earning rules
export const LOYALTY_RULES = {
  pointsPerRupee: 1, // 1 point per Rs. 1 spent
  minPointsForRedemption: 100,
  redemptionValue: 0.5, // Rs. 0.5 per point
  tierThresholds: {
    bronze: 0,
    silver: 500,
    gold: 2000,
    platinum: 5000,
  },
  tierMultipliers: {
    bronze: 1,
    silver: 1.5,
    gold: 2,
    platinum: 3,
  },
};
