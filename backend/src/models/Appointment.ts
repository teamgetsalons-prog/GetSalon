import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;
import type { BookingStatus } from "../../../shared/dist/types.js";

export interface IAppointment {
  _id: Types.ObjectId;
  bookingNumber: string;
  customer: Types.ObjectId;
  salon: Types.ObjectId;
  service: Types.ObjectId;
  staff?: Types.ObjectId;
  /** Snapshot of the service at booking time (immutable history) */
  serviceSnapshot: {
    name: string;
    price: number;
    duration: number;
  };
  date: string; // YYYY-MM-DD (salon local date)
  startTime: string; // "14:30"
  startMinutes: number; // 870 — used for overlap queries
  endMinutes: number;
  price: number;
  status: BookingStatus;
  notes?: string;
  cancelledBy?: "customer" | "salon" | "admin";
  cancelReason?: string;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
    serviceSnapshot: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      duration: { type: Number, required: true },
    },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    startMinutes: { type: Number, required: true },
    endMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
      default: "pending",
      index: true,
    },
    notes: { type: String, maxlength: 500 },
    cancelledBy: { type: String, enum: ["customer", "salon", "admin"] },
    cancelReason: String,
    reminderSentAt: Date,
  },
  { timestamps: true }
);

appointmentSchema.index({ salon: 1, date: 1, status: 1 });
appointmentSchema.index({ customer: 1, date: -1 });

// Backstop against double booking: one active appointment per staff member
// per exact slot. The service layer also checks overlapping ranges.
appointmentSchema.index(
  { staff: 1, date: 1, startMinutes: 1 },
  {
    unique: true,
    partialFilterExpression: {
      staff: { $exists: true },
      status: { $in: ["pending", "confirmed"] },
    },
  }
);

export const Appointment: Model<IAppointment> =
  (models.Appointment as Model<IAppointment>) ||
  model<IAppointment>("Appointment", appointmentSchema);
