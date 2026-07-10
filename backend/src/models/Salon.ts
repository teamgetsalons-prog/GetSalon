import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;
import type {
  FaqItem,
  GalleryImage,
  GenderServed,
  GeoPoint,
  OpeningHour,
  SalonStatus,
} from "../../../shared/dist/types.js";

export interface ISalon {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  owner: Types.ObjectId;
  description: string;
  about?: string;
  categories: Types.ObjectId[];
  city: Types.ObjectId;
  cityName: string; // denormalized for fast cards & SEO URLs
  area?: Types.ObjectId;
  areaName?: string;
  address: string;
  location?: GeoPoint;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  socials?: { facebook?: string; instagram?: string; tiktok?: string };
  genderServed: GenderServed;
  homeService: boolean;
  coverImage: string;
  logo?: string;
  gallery: GalleryImage[];
  openingHours: OpeningHour[];
  faqs: FaqItem[];
  policies?: { cancellation?: string; notes?: string };
  rating: { average: number; count: number };
  priceRange: { min: number; max: number };
  status: SalonStatus;
  rejectionReason?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  views: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const salonSchema = new Schema<ISalon>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, index: true },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: { type: String, required: true, maxlength: 500 },
    about: { type: String, maxlength: 3000 },
    categories: [
      { type: Schema.Types.ObjectId, ref: "Category", index: true },
    ],
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
      index: true,
    },
    cityName: { type: String, required: true },
    area: { type: Schema.Types.ObjectId, ref: "Area" },
    areaName: String,
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    phone: { type: String, required: true },
    whatsapp: String,
    email: String,
    website: String,
    socials: {
      facebook: String,
      instagram: String,
      tiktok: String,
    },
    genderServed: {
      type: String,
      enum: ["men", "women", "unisex"],
      default: "unisex",
      index: true,
    },
    homeService: { type: Boolean, default: false },
    coverImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
    },
    logo: String,
    gallery: [
      {
        url: { type: String, required: true },
        publicId: String,
        caption: String,
      },
    ],
    openingHours: [
      {
        day: { type: Number, min: 0, max: 6, required: true },
        open: { type: String, default: "10:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    policies: {
      cancellation: String,
      notes: String,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    rejectionReason: String,
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

// Search & discovery indexes
salonSchema.index({ name: "text", description: "text", tags: "text" });
salonSchema.index({ location: "2dsphere" });
salonSchema.index({ status: 1, city: 1, genderServed: 1 });
salonSchema.index({ status: 1, "rating.average": -1 });
salonSchema.index({ status: 1, createdAt: -1 });

export const Salon: Model<ISalon> =
  (models.Salon as Model<ISalon>) || model<ISalon>("Salon", salonSchema);
