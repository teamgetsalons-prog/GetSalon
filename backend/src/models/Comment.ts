import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

export type CommentStatus = "approved" | "pending" | "rejected";

export interface IComment {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  customer: Types.ObjectId;
  rating: number;
  comment: string;
  photos: string[];
  helpfulVotes: Types.ObjectId[];
  ownerReply?: string;
  ownerReplyCreatedAt?: Date;
  /** approved = visible publicly (the default - see comment.service.ts's
   * automated spam check). pending = flagged by enough user reports to hide
   * until an admin reviews it. rejected = failed the automated check at
   * submission time and was never made visible. */
  status: CommentStatus;
  /** Users who reported this comment - deduped, and used to auto-hide once
   * a small threshold is reached without needing pre-moderation for everyone. */
  reportedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
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
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
    photos: [String],
    helpfulVotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    ownerReply: { type: String, maxlength: 1000 },
    ownerReplyCreatedAt: Date,
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
      index: true,
    },
    reportedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

commentSchema.index({ salon: 1, createdAt: -1 });
commentSchema.index({ salon: 1, rating: 1 });
commentSchema.index({ status: 1, createdAt: -1 });

export const Comment: Model<IComment> =
  (models.Comment as Model<IComment>) ||
  model<IComment>("Comment", commentSchema);
