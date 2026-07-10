import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Salon, User } from "../models/index.js";
import { toSalonCard } from "../services/salon.service.js";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  const doc = await User.findById(req.user!.id).populate({
    path: "favorites",
    match: { status: "approved" },
    populate: { path: "categories", select: "name" },
  });
  if (!doc) return fail(res, "User not found.", 404);

  const favorites = (doc.favorites as unknown as Array<{ categories?: Array<{ name?: string }> }>)
    .filter(Boolean)
    .map((s) => toSalonCard(s as any));

  return ok(res, favorites);
});

const toggleSchema = z.object({ salonId: z.string().min(1) });

router.post("/:salonId", authenticate, async (req: Request, res: Response) => {
  const { salonId } = req.params;

  const salon = await Salon.findById(salonId).select("_id");
  if (!salon) return fail(res, "Salon not found.", 404);

  const doc = await User.findById(req.user!.id).select("favorites");
  if (!doc) return fail(res, "User not found.", 404);

  const has = doc.favorites.some((f) => f.toString() === salonId);
  if (has) {
    await User.updateOne({ _id: req.user!.id }, { $pull: { favorites: salonId } });
  } else {
    await User.updateOne({ _id: req.user!.id }, { $addToSet: { favorites: salonId } });
  }

  return ok(res, { favorited: !has });
});

export { router as favoriteRoutes };
export default router;
