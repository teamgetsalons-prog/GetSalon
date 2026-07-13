import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { SupportMessage } from "../models/index.js";
import { writeLimiter } from "../middleware/rate-limit.js";

const router = Router();

const createSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email is required").max(200),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

// Public contact form — anyone can send a message to admins
router.post("/contact", writeLimiter, async (req: Request, res: Response) => {
  const input = contactSchema.parse(req.body);
  const doc = await SupportMessage.create({
    contactName: input.name,
    contactEmail: input.email,
    subject: input.subject,
    message: input.message,
  });
  return ok(res, { success: true }, undefined, 201);
});

// Send a message to the platform admins (authenticated — salon owners).
router.post("/", authenticate, writeLimiter, async (req: Request, res: Response) => {
  const input = createSchema.parse(req.body);
  const doc = await SupportMessage.create({
    from: req.user!.id,
    salon: req.user!.salonId || undefined,
    subject: input.subject,
    message: input.message,
  });
  return ok(res, doc.toJSON(), undefined, 201);
});

// The sender's own messages (with admin replies). Opening the list counts
// as reading any waiting replies, which clears the panel badge.
router.get("/mine", authenticate, async (req: Request, res: Response) => {
  const messages = await SupportMessage.find({ from: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(50);
  SupportMessage.updateMany(
    { from: req.user!.id, replySeen: false },
    { replySeen: true }
  ).catch(() => {});
  return ok(res, messages);
});

export { router as supportRoutes };
export default router;
