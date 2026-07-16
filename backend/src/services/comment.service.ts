import mongoose from "mongoose";
const { Types } = mongoose;
import { connectDB } from "../db.js";
import { Comment, Salon, type CommentStatus } from "../models/index.js";
import { ApiError } from "../middleware/error-handler.js";
import { roundRating } from "../../../shared/dist/utils.js";
import { notify } from "./notification.service.js";

export interface CreateCommentInput {
  salonId: string;
  rating: number;
  comment: string;
  photos?: string[];
}

// A comment gets auto-hidden once this many distinct users report it, without
// needing to pre-moderate every review before it can go live.
const REPORT_THRESHOLD = 3;

const URL_PATTERN = /(https?:\/\/|www\.)\S+/i;
const PHONE_PATTERN = /(\+?\d[\d\s\-().]{8,}\d)/;

/**
 * Lightweight, automated first line of defense against spam - deliberately
 * conservative (a few clear signals, not a full ML classifier) so genuine
 * reviews are never falsely rejected. Returns a user-facing reason when the
 * text should be blocked, or null when it's fine to publish immediately.
 */
function detectSpam(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length < 3) return "Please write a bit more about your experience.";
  if (URL_PATTERN.test(trimmed)) return "Reviews can't contain links.";
  if (PHONE_PATTERN.test(trimmed)) return "Reviews can't contain phone numbers.";

  // Keyboard-mash / repeated-character spam: one character (or a short
  // repeating chunk) dominating most of the text.
  const letters = trimmed.replace(/\s/g, "");
  if (letters.length >= 6) {
    const counts = new Map<string, number>();
    for (const ch of letters.toLowerCase()) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    const maxCount = Math.max(...counts.values());
    if (maxCount / letters.length > 0.6) {
      return "This doesn't look like a real review - please describe your experience.";
    }
  }

  return null;
}

/** Recompute the denormalized rating on a salon from its publicly-visible comments */
export async function recalcSalonRatingFromComments(salonId: string): Promise<void> {
  const [agg] = await Comment.aggregate<{
    _id: null;
    average: number;
    count: number;
  }>([
    {
      $match: {
        salon: new Types.ObjectId(salonId),
        status: "approved",
      },
    },
    {
      $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  await Salon.updateOne(
    { _id: salonId },
    {
      rating: {
        average: agg ? roundRating(agg.average) : 0,
        count: agg?.count ?? 0,
      },
    }
  );
}

/** Create a new comment/rating for a salon */
export async function createComment(
  customerId: string,
  input: CreateCommentInput
) {
  await connectDB();

  // Customers may leave more than one review for the same salon (e.g. after
  // separate visits), so there's deliberately no one-per-customer cap here.
  const spamReason = detectSpam(input.comment);
  if (spamReason) throw new ApiError(spamReason, 422);

  const comment = await Comment.create({
    salon: input.salonId,
    customer: customerId,
    rating: input.rating,
    comment: input.comment,
    photos: input.photos || [],
    status: "approved",
  });

  // Recalculate salon rating
  await recalcSalonRatingFromComments(input.salonId);

  // Notify salon owner
  const salon = await Salon.findById(input.salonId).select("owner name");
  if (salon) {
    await notify({
      userId: salon.owner.toString(),
      type: "review_received",
      title: `New ${input.rating}★ rating`,
      message: `${salon.name} received a new rating: "${input.comment.slice(0, 80)}"`,
      link: "/salon-dashboard/reviews",
    });
  }

  return comment;
}

/** Get publicly-visible comments for a salon */
export async function getSalonComments(
  salonId: string,
  page: number = 1,
  limit: number = 10
) {
  await connectDB();

  const filter = { salon: salonId, status: "approved" as const };
  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate("customer", "name image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Comment.countDocuments(filter),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/** A user reports a comment as spam/abusive. Auto-hides it once enough
 * distinct users have reported the same one, rather than acting on a single
 * report (which would make the button trivially abusable). */
export async function reportComment(commentId: string, userId: string) {
  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError("Comment not found.", 404);

  const alreadyReported = comment.reportedBy.some((id) => id.toString() === userId);
  if (alreadyReported) return { reported: true, hidden: comment.status !== "approved" };

  comment.reportedBy.push(new Types.ObjectId(userId));
  let hidden = false;
  if (comment.status === "approved" && comment.reportedBy.length >= REPORT_THRESHOLD) {
    comment.status = "pending";
    hidden = true;
  }
  await comment.save();

  if (hidden) await recalcSalonRatingFromComments(comment.salon.toString());

  return { reported: true, hidden };
}

/** Admin: browse comments, optionally filtered by status, or by "reported"
 * (has at least one report - broader than status "pending", which only
 * covers comments that crossed the auto-hide threshold). Omit for all. */
export async function adminListComments(
  status?: CommentStatus | "reported",
  page: number = 1,
  limit: number = 20
) {
  await connectDB();

  const filter =
    status === "reported"
      ? { "reportedBy.0": { $exists: true } }
      : status
        ? { status }
        : {};
  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate("customer", "name email")
      .populate("salon", "name slug")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Comment.countDocuments(filter),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/** Admin: approve or permanently reject a reported comment */
export async function adminModerateComment(commentId: string, status: "approved" | "rejected") {
  await connectDB();
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError("Comment not found.", 404);

  comment.status = status;
  if (status === "approved") comment.reportedBy = [];
  await comment.save();
  await recalcSalonRatingFromComments(comment.salon.toString());

  return comment;
}

/** Vote helpful on a comment */
export async function voteHelpful(commentId: string, userId: string) {
  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError("Comment not found.", 404);

  const hasVoted = comment.helpfulVotes.some((v) => v.toString() === userId);

  if (hasVoted) {
    comment.helpfulVotes = comment.helpfulVotes.filter(
      (v) => v.toString() !== userId
    );
  } else {
    comment.helpfulVotes.push(new Types.ObjectId(userId));
  }

  await comment.save();

  return { helpfulCount: comment.helpfulVotes.length, voted: !hasVoted };
}

/** Delete a comment (only by the author or admin) */
export async function deleteComment(
  commentId: string,
  userId: string,
  role: string
) {
  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError("Comment not found.", 404);

  if (comment.customer.toString() !== userId && role !== "admin") {
    throw new ApiError("You can only delete your own comments.", 403);
  }

  const salonId = comment.salon.toString();
  await Comment.findByIdAndDelete(commentId);

  // Recalculate salon rating
  await recalcSalonRatingFromComments(salonId);

  return { success: true };
}

/** Only the owning salon's owner (or an admin) may reply to a review. */
async function assertCanReply(
  comment: { salon: mongoose.Types.ObjectId },
  userId: string,
  role: string
): Promise<void> {
  if (role === "admin") return;
  const salon = await Salon.findOne({ _id: comment.salon, owner: userId }).select("_id");
  if (!salon) throw new ApiError("Only the salon owner can reply to reviews.", 403);
}

/** Add or edit the salon owner's reply to a review (one reply per review). */
export async function replyToComment(
  commentId: string,
  userId: string,
  role: string,
  reply: string
) {
  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError("Comment not found.", 404);
  await assertCanReply(comment, userId, role);

  comment.ownerReply = reply;
  comment.ownerReplyCreatedAt = new Date();
  await comment.save();

  return comment;
}

/** Remove the salon owner's reply from a review. */
export async function deleteCommentReply(
  commentId: string,
  userId: string,
  role: string
) {
  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError("Comment not found.", 404);
  await assertCanReply(comment, userId, role);

  comment.ownerReply = undefined;
  comment.ownerReplyCreatedAt = undefined;
  await comment.save();

  return { success: true };
}
