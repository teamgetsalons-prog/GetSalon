import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;
import type { UserRole } from "../../../shared/dist/types.js";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  favorites: Types.ObjectId[];
  /** For role=staff: the salon this staff account belongs to */
  salon?: Types.ObjectId;
  emailVerifiedAt?: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: ["customer", "owner", "staff", "admin"],
      default: "customer",
      index: true,
    },
    avatar: String,
    city: String,
    favorites: [{ type: Schema.Types.ObjectId, ref: "Salon" }],
    salon: { type: Schema.Types.ObjectId, ref: "Salon" },
    emailVerifiedAt: Date,
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", userSchema);
