import { Schema, model, models, type Model, type Types } from "mongoose";
import type { OpeningHour } from "@/types";

export interface IStaffLeave {
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface IStaff {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  /** Optional link to a login-enabled user account */
  user?: Types.ObjectId;
  name: string;
  title?: string;
  avatar?: string;
  bio?: string;
  services: Types.ObjectId[];
  workingHours: OpeningHour[];
  leaves: IStaffLeave[];
  rating: { average: number; count: number };
  completedBookings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    title: String,
    avatar: String,
    bio: String,
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    workingHours: [
      {
        day: { type: Number, min: 0, max: 6, required: true },
        open: { type: String, default: "10:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
    ],
    leaves: [
      {
        date: { type: String, required: true },
        reason: String,
      },
    ],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    completedBookings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Staff: Model<IStaff> =
  (models.Staff as Model<IStaff>) || model<IStaff>("Staff", staffSchema);
