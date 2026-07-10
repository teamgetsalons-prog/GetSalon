import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IService {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  name: string;
  description?: string;
  category?: Types.ObjectId;
  duration: number; // minutes
  price: number; // PKR
  discountPrice?: number;
  image?: string;
  isActive: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    duration: { type: Number, required: true, min: 10, max: 480 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    image: String,
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    bookingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ salon: 1, isActive: 1 });

export const Service: Model<IService> =
  (models.Service as Model<IService>) ||
  model<IService>("Service", serviceSchema);
