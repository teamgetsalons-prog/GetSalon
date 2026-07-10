import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ICity {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  province: string;
  image?: string;
  isActive: boolean;
  order: number;
  salonCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    province: { type: String, required: true },
    image: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    salonCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const City: Model<ICity> =
  (models.City as Model<ICity>) || model<ICity>("City", citySchema);

export interface IArea {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  city: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const areaSchema = new Schema<IArea>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

areaSchema.index({ city: 1, slug: 1 }, { unique: true });

export const Area: Model<IArea> =
  (models.Area as Model<IArea>) || model<IArea>("Area", areaSchema);
