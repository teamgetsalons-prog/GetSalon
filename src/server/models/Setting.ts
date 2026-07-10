import { Schema, model, models, type Model, type Types } from "mongoose";

/** Simple key/value store for site-wide settings managed from the admin CMS */
export interface ISetting {
  _id: Types.ObjectId;
  key: string;
  value: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> =
  (models.Setting as Model<ISetting>) ||
  model<ISetting>("Setting", settingSchema);
