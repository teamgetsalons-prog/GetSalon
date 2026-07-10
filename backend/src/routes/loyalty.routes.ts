import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { getLoyaltyData, redeemPoints, earnPoints } from "../services/loyalty.service.js";

const router = Router();

const redeemSchema = z.object({
  points: z.number().min(100, "Minimum 100 points required"),
});

const earnSchema = z.object({
  appointmentId: z.string().min(1),
  points: z.number().min(1),
});

router.get("/", authenticate, async (req: Request, res: Response) => {
  const loyaltyData = await getLoyaltyData(req.user!.id);
  return ok(res, loyaltyData);
});

router.post("/earn", authenticate, async (req: Request, res: Response) => {
  const input = earnSchema.parse(req.body);
  const result = await earnPoints(req.user!.id, input.points, input.appointmentId, "");
  return ok(res, result);
});

router.post("/redeem", authenticate, async (req: Request, res: Response) => {
  const input = redeemSchema.parse(req.body);
  const result = await redeemPoints(req.user!.id, input.points);
  return ok(res, result);
});

export { router as loyaltyRoutes };
export default router;
