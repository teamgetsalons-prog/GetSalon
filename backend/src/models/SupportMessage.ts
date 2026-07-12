import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

/** A message from a salon owner (or any user) to the platform admins. */
export interface ISupportMessage {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  salon?: Types.ObjectId;
  subject: string;
  message: string;
  status: "open" | "resolved";
  reply?: string;
  repliedAt?: Date;
  /** false while an admin reply is waiting for the sender to read it */
  replySeen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    salon: { type: Schema.Types.ObjectId, ref: "Salon" },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
    reply: { type: String, trim: true, maxlength: 3000 },
    repliedAt: Date,
    replySeen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

supportMessageSchema.index({ createdAt: -1 });

export const SupportMessage: Model<ISupportMessage> =
  (models.SupportMessage as Model<ISupportMessage>) ||
  model<ISupportMessage>("SupportMessage", supportMessageSchema);
