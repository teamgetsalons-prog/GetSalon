import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Review } from "../models/index.js";
import { createReviewSchema, reviewActionSchema } from "../../../shared/dist/validations/review.js";
import { createReview, reviewAction } from "../services/review.service.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const salonId = req.query.salonId as string;
  if (!salonId) return fail(res, "salonId is required.");

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  const filter = { salon: salonId, status: "published" as const };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("customer", "name avatar")
      .populate("staff", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return ok(res, reviews, {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

router.post("/", authenticate, async (req: Request, res: Response) => {
  const input = createReviewSchema.parse(req.body);
  const review = await createReview(req.user!.id, input);

  return ok(res, { id: review._id.toString() }, undefined, 201);
});

router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const input = reviewActionSchema.parse(req.body);

  const review = await reviewAction(id, req.user! as any, input);

  return ok(res, {
    id: review._id.toString(),
    helpfulCount: (review as any).helpfulVotes?.length ?? 0,
    status: review.status,
    reply: (review as any).reply ?? null,
  });
});

export { router as reviewRoutes };
export default router;
