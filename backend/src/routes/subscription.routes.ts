import { Router } from "express";
import { connectDB } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import {
  getSalonSubscription,
  upgradeSubscription,
  getSubscriptionStatus,
} from "../services/subscription.service.js";
import { getActorSalon } from "../services/salon.service.js";

const router = Router();

// GET /subscription — current status
router.get("/", authenticate, async (req, res, next) => {
  try {
    await connectDB();
    const salon = await getActorSalon(req.user!);
    if (!salon) return fail(res, "No salon found.", 404);
    const salonId = salon._id.toString();
    const [subscription, status] = await Promise.all([
      getSalonSubscription(salonId),
      getSubscriptionStatus(salonId),
    ]);
    ok(res, { subscription, status });
  } catch (err) { next(err); }
});

// POST /subscription — upgrade plan (demo/free)
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!plan || !["basic", "premium"].includes(plan)) {
      return fail(res, "Plan must be 'basic' or 'premium'.", 400);
    }
    await connectDB();
    const salon = await getActorSalon(req.user!);
    if (!salon) return fail(res, "No salon found.", 404);
    const subscription = await upgradeSubscription(salon._id.toString(), plan);
    ok(res, subscription, { message: `Upgraded to ${plan}.` });
  } catch (err) { next(err); }
});

export const subscriptionRoutes = router;
