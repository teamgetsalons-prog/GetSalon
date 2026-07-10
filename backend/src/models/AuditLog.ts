import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IAuditLog {
  _id: Types.ObjectId;
  actor?: Types.ObjectId;
  actorRole?: string;
  action: string; // e.g. "salon.approve", "booking.cancel"
  entity: string; // e.g. "Salon"
  entityId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: String,
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true },
    entityId: String,
    meta: { type: Schema.Types.Mixed },
    ip: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  (models.AuditLog as Model<IAuditLog>) ||
  model<IAuditLog>("AuditLog", auditLogSchema);
