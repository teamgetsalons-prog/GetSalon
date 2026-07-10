import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { createComment, getSalonComments, voteHelpful, deleteComment } from "../services/comment.service.js";

const router = Router();

const createCommentSchema = z.object({
  salonId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3).max(2000),
  photos: z.array(z.string().url()).max(5).optional(),
});

router.get("/", async (req: Request, res: Response) => {
  const salonId = req.query.salonId as string;
  if (!salonId) return fail(res, "salonId is required.");

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  const result = await getSalonComments(salonId, page, limit);

  return ok(res, result.comments, {
    pagination: {
      page: result.page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

router.post("/", authenticate, async (req: Request, res: Response) => {
  const input = createCommentSchema.parse(req.body);
  const comment = await createComment(req.user!.id, input);

  return ok(res, {
    _id: comment._id.toString(),
    rating: comment.rating,
    comment: comment.comment,
    photos: comment.photos,
    createdAt: comment.createdAt.toISOString(),
  }, undefined, 201);
});

router.post("/:id/helpful", authenticate, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await voteHelpful(id, req.user!.id);
  return ok(res, result);
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await deleteComment(id, req.user!.id, req.user!.role || "customer");
  return ok(res, null);
});

export { router as commentRoutes };
export default router;
