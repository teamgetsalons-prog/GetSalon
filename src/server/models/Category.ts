import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  /** lucide icon name used by the frontend icon map */
  icon?: string;
  image?: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: String,
    image: String,
    description: String,
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  (models.Category as Model<ICategory>) ||
  model<ICategory>("Category", categorySchema);
