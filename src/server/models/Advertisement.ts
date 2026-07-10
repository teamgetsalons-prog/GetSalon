import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IAdvertisement {
  _id: Types.ObjectId;
  title: string;
  image: string;
  link: string;
  placement: "home_hero" | "home_banner" | "search_top" | "salon_sidebar";
  salon?: Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  clicks: number;
  impressions: number;
  createdAt: Date;
  updatedAt: Date;
}

const advertisementSchema = new Schema<IAdvertisement>(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    placement: {
      type: String,
      enum: ["home_hero", "home_banner", "search_top", "salon_sidebar"],
      required: true,
      index: true,
    },
    salon: { type: Schema.Types.ObjectId, ref: "Salon" },
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Advertisement: Model<IAdvertisement> =
  (models.Advertisement as Model<IAdvertisement>) ||
  model<IAdvertisement>("Advertisement", advertisementSchema);
