import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { ok } from "../middleware/error-handler.js";
import { Notification } from "../models/index.js";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  const [items, unread] = await Promise.all([
    Notification.find({ user: req.user!.id }).sort({ createdAt: -1 }).limit(30),
    Notification.countDocuments({ user: req.user!.id, readAt: null }),
  ]);

  return ok(res, { items, unread });
});

router.patch("/read", authenticate, async (req: Request, res: Response) => {
  await Notification.updateMany(
    { user: req.user!.id, readAt: null },
    { readAt: new Date() }
  );
  return ok(res, { done: true });
});

router.patch("/:id/read", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  await Notification.updateOne(
    { _id: id, user: req.user!.id },
    { readAt: new Date() }
  );
  return ok(res, { done: true });
});

export { router as notificationRoutes };
export default router;
