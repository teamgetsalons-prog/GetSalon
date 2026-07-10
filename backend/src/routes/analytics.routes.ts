import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Salon } from "../models/index.js";
import { getSalonAnalytics, trackProfileView, trackPhoneClick, trackWhatsAppClick } from "../services/analytics.service.js";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  const salon = await Salon.findOne({ owner: req.user!.id });
  if (!salon) return fail(res, "No salon found.", 404);

  const analytics = await getSalonAnalytics(salon._id.toString());
  return ok(res, analytics);
});

router.post("/profile-view", async (req: Request, res: Response) => {
  const { salonId } = req.body;
  if (!salonId) return fail(res, "salonId is required.");

  await trackProfileView(salonId);
  return ok(res, { recorded: true });
});

router.post("/phone-click", async (req: Request, res: Response) => {
  const { salonId } = req.body;
  if (!salonId) return fail(res, "salonId is required.");

  await trackPhoneClick(salonId);
  return ok(res, { recorded: true });
});

router.post("/whatsapp-click", async (req: Request, res: Response) => {
  const { salonId } = req.body;
  if (!salonId) return fail(res, "salonId is required.");

  await trackWhatsAppClick(salonId);
  return ok(res, { recorded: true });
});

export { router as analyticsRoutes };
export default router;
