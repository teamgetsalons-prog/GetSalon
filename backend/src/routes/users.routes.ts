import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { User } from "../models/index.js";
import { updateProfileSchema } from "../../../shared/src/validations/auth.js";

const router = Router();

router.get("/me", authenticate, async (req: Request, res: Response) => {
  const doc = await User.findById(req.user!.id).select("name email phone avatar city role createdAt");
  if (!doc) return fail(res, "User not found.", 404);
  return ok(res, doc.toJSON());
});

router.patch("/me", authenticate, async (req: Request, res: Response) => {
  const input = updateProfileSchema.parse(req.body);

  const doc = await User.findById(req.user!.id);
  if (!doc) return fail(res, "User not found.", 404);

  if (input.name !== undefined) doc.name = input.name;
  if (input.phone !== undefined) doc.phone = input.phone || undefined;
  if (input.avatar !== undefined) doc.avatar = input.avatar || undefined;
  if (input.city !== undefined) doc.city = input.city || undefined;

  await doc.save();
  return ok(res, { name: doc.name, phone: doc.phone, avatar: doc.avatar, city: doc.city });
});

export { router as userRoutes };
export default router;
