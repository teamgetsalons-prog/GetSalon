import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IComment {
  _id: Types.ObjectId;
  salon: Types.ObjectId;
  customer: Types.ObjectId;
  rating: number;
  comment: string;
  photos: string[];
  helpfulVotes: Types.ObjectId[];
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
  },
  { timestamps: true }
);

commentSchema.index({ salon: 1, createdAt: -1 });
commentSchema.index({ salon: 1, rating: 1 });

export const Comment: Model<IComment> =
  (models.Comment as Model<IComment>) ||
  model<IComment>("Comment", commentSchema);
