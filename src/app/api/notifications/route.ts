import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { Notification } from "@/server/models";
import { handleApiError, ok, requireUser } from "@/server/api-helpers";

/** GET /api/notifications — latest notifications + unread count */
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const [items, unread] = await Promise.all([
      Notification.find({ user: user.id }).sort({ createdAt: -1 }).limit(30),
      Notification.countDocuments({ user: user.id, readAt: null }),
    ]);

    return ok({ items, unread });
  } catch (err) {
    return handleApiError(err);
  }
}

const markSchema = z.object({
  id: z.string().optional(), // omit = mark all read
});

/** PATCH /api/notifications — mark one/all as read */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const { id } = markSchema.parse(await req.json().catch(() => ({})));

    await connectDB();
    if (id) {
      await Notification.updateOne(
        { _id: id, user: user.id },
        { readAt: new Date() }
      );
    } else {
      await Notification.updateMany(
        { user: user.id, readAt: null },
        { readAt: new Date() }
      );
    }

    return ok({ done: true });
  } catch (err) {
    return handleApiError(err);
  }
}
