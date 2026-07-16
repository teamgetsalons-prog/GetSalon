import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import {
  createComment,
  getSalonComments,
  voteHelpful,
  deleteComment,
  replyToComment,
  deleteCommentReply,
  reportComment,
  adminListComments,
  adminModerateComment,
} from "../services/comment.service.js";
import type { CommentStatus } from "../models/index.js";

const router = Router();

const createCommentSchema = z.object({
  salonId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3).max(2000),
  photos: z.array(z.string().url()).max(5).optional(),
});

const replySchema = z.object({
  reply: z.string().min(2, "Reply must be at least 2 characters.").max(1000),
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

// Salon owner add/edit reply - same endpoint handles both, since a reply
// is a single field that either exists or doesn't.
router.patch("/:id/reply", authenticate, requireRole("owner", "admin"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const input = replySchema.parse(req.body);
  const comment = await replyToComment(id, req.user!.id, req.user!.role || "customer", input.reply);

  return ok(res, {
    ownerReply: comment.ownerReply,
    ownerReplyCreatedAt: comment.ownerReplyCreatedAt,
  });
});

router.delete("/:id/reply", authenticate, requireRole("owner", "admin"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await deleteCommentReply(id, req.user!.id, req.user!.role || "customer");
  return ok(res, null);
});

// Any logged-in user can flag a review as spam/abusive. Auto-hides once
// enough distinct users have reported the same one (see REPORT_THRESHOLD).
router.post("/:id/report", authenticate, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await reportComment(id, req.user!.id);
  return ok(res, result);
});

// ── Admin moderation ────────────────────────────────────────

const VALID_STATUSES = ["approved", "pending", "rejected"] as const;

router.get("/admin/pending", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const statusParam = req.query.status as string | undefined;
  const status =
    statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as CommentStatus)
      : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const result = await adminListComments(status, page, limit);
  return ok(res, result.comments, {
    pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
  });
});

const moderateSchema = z.object({ status: z.enum(["approved", "rejected"]) });

router.patch("/:id/moderate", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const input = moderateSchema.parse(req.body);
  const comment = await adminModerateComment(id, input.status);
  return ok(res, { id: comment._id.toString(), status: comment.status });
});

export { router as commentRoutes };
export default router;
