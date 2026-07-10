import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ICoupon {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minAmount?: number;
  maxUses: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minAmount: { type: Number, min: 0 },
    maxUses: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ salon: 1, code: 1 }, { unique: true });

export const Coupon: Model<ICoupon> =
  (models.Coupon as Model<ICoupon>) || model<ICoupon>("Coupon", couponSchema);
