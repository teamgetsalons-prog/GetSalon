import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { ok } from "../middleware/error-handler.js";
import { SupportMessage } from "../models/index.js";

const router = Router();

const createSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

// Send a message to the platform admins.
router.post("/", authenticate, async (req: Request, res: Response) => {
  const input = createSchema.parse(req.body);
  const doc = await SupportMessage.create({
    from: req.user!.id,
    salon: req.user!.salonId || undefined,
    subject: input.subject,
    message: input.message,
  });
  return ok(res, doc.toJSON(), undefined, 201);
});

// The sender's own messages (with admin replies).
router.get("/mine", authenticate, async (req: Request, res: Response) => {
  const messages = await SupportMessage.find({ from: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(50);
  return ok(res, messages);
});

export { router as supportRoutes };
export default router;
