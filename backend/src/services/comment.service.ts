import mongoose from "mongoose";
const { Types } = mongoose;
import { connectDB } from "../db.js";
import { Comment, Salon } from "../models/index.js";
import { ApiError } from "../middleware/error-handler.js";
import { roundRating } from "../../../shared/dist/utils.js";
import { notify } from "./notification.service.js";

export interface CreateCommentInput {
  salonId: string;
  rating: number;
  comment: string;
  photos?: string[];
}

/** Recompute the denormalized rating on a salon from comments */
export async function recalcSalonRatingFromComments(salonId: string): Promise<void> {
  const [agg] = await Comment.aggregate<{
    _id: null;
    average: number;
    count: number;
  }>([
    {
      $match: {
        salon: new Types.ObjectId(salonId),
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

  // Check if user already commented on this salon
  const existing = await Comment.findOne({
    salon: input.salonId,
    customer: customerId,
  });

  if (existing) {
    throw new ApiError("You have already reviewed this salon. You can edit your existing review.", 409);
  }

  const comment = await Comment.create({
    salon: input.salonId,
    customer: customerId,
    rating: input.rating,
    comment: input.comment,
    photos: input.photos || [],
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

/** Get comments for a salon */
export async function getSalonComments(
  salonId: string,
  page: number = 1,
  limit: number = 10
) {
  await connectDB();

  const [comments, total] = await Promise.all([
    Comment.find({ salon: salonId })
      .populate("customer", "name image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Comment.countDocuments({ salon: salonId }),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
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
