import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  customer: Types.ObjectId;
  /** Verified review: tied 1:1 to a completed appointment */
  appointment: Types.ObjectId;
  staff?: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  photos: string[];
  reply?: { text: string; repliedAt: Date };
  helpfulVotes: Types.ObjectId[];
  reports: { by: Types.ObjectId; reason?: string; reportedAt: Date }[];
  status: "published" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, // one review per completed booking
    },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 2000 },
    photos: [String],
    reply: {
      text: String,
      repliedAt: Date,
    },
    helpfulVotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reports: [
      {
        by: { type: Schema.Types.ObjectId, ref: "User" },
        reason: String,
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ salon: 1, status: 1, createdAt: -1 });

export const Review: Model<IReview> =
  (models.Review as Model<IReview>) || model<IReview>("Review", reviewSchema);
