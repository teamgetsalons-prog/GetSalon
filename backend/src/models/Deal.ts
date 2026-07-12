import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IDeal {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  service?: Types.ObjectId;
  serviceName?: string;
  image?: string;
  terms?: string;
  maxRedemptions?: number;
  redemptionCount: number;
  isActive: boolean;
  isFeatured: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dealSchema = new Schema<IDeal>(
  {
    salon: { type: Schema.Types.ObjectId, ref: "Salon", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 500 },
    originalPrice: { type: Number, required: true, min: 0 },
    dealPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    serviceName: { type: String },
    image: String,
    terms: { type: String, maxlength: 500 },
    maxRedemptions: { type: Number },
    redemptionCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    startDate: { type: String },
    endDate: { type: String },
  },
  { timestamps: true }
);

dealSchema.index({ salon: 1, isActive: 1 });
dealSchema.index({ isActive: 1, isFeatured: -1, createdAt: -1 });
dealSchema.index({ endDate: 1, isActive: 1 });

export const Deal: Model<IDeal> =
  (models.Deal as Model<IDeal>) || model<IDeal>("Deal", dealSchema);
