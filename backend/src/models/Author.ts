import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IAuthor {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  bio: string;
  /** Optional one-line credential, e.g. "5 years in the beauty industry" */
  title?: string;
  avatar?: string;
  /** True for a team/editorial byline rather than a named individual - controls
   * whether Article schema renders this as schema.org Person or Organization. */
  isTeam: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, index: true },
    bio: { type: String, required: true, maxlength: 1000 },
    title: { type: String, maxlength: 150 },
    avatar: String,
    isTeam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Author: Model<IAuthor> =
  (models.Author as Model<IAuthor>) || model<IAuthor>("Author", authorSchema);
