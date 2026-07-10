import { Types } from "mongoose";
import { connectDB } from "@/server/db";
import {
  Appointment,
  Review,
  Salon,
  Staff,
  type IReview,
} from "@/server/models";
import { ApiError } from "@/server/api-helpers";
import { roundRating } from "@/lib/utils";
import type {
  CreateReviewInput,
  ReviewActionInput,
} from "@/lib/validations/review";
import type { UserRole } from "@/types";
import { notify } from "./notification.service";

/** Recompute the denormalized rating on a salon (and optionally staff) */
export async function recalcSalonRating(salonId: string): Promise<void> {
  const [agg] = await Review.aggregate<{
    _id: null;
    average: number;
    count: number;
  }>([
    {
      $match: {
        salon: new Types.ObjectId(salonId),
        status: "published",
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

async function recalcStaffRating(staffId: string): Promise<void> {
  const [agg] = await Review.aggregate<{
    _id: null;
    average: number;
    count: number;
  }>([
    {
      $match: {
        staff: new Types.ObjectId(staffId),
        status: "published",
      },
    },
    {
      $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  await Staff.updateOne(
    { _id: staffId },
    {
      rating: {
        average: agg ? roundRating(agg.average) : 0,
        count: agg?.count ?? 0,
      },
    }
  );
}

/** Verified reviews only: must own a COMPLETED appointment, one review each */
export async function createReview(
  customerId: string,
  input: CreateReviewInput
): Promise<IReview> {
  await connectDB();

  const appointment = await Appointment.findOne({
    _id: input.appointmentId,
    customer: customerId,
  });
  if (!appointment) throw new ApiError("Booking not found.", 404);
  if (appointment.status !== "completed") {
    throw new ApiError("You can review a salon after your visit is completed.");
  }

  const already = await Review.exists({ appointment: appointment._id });
  if (already) {
    throw new ApiError("You have already reviewed this visit.", 409);
  }

  const review = await Review.create({
    salon: appointment.salon,
    customer: customerId,
    appointment: appointment._id,
    staff: appointment.staff,
    rating: input.rating,
    title: input.title || undefined,
    comment: input.comment,
    photos: input.photos,
    status: "published",
  });

  await recalcSalonRating(appointment.salon.toString());
  if (appointment.staff) {
    await recalcStaffRating(appointment.staff.toString());
  }

  // Tell the owner
  const salon = await Salon.findById(appointment.salon).select("owner name");
  if (salon) {
    await notify({
      userId: salon.owner.toString(),
      type: "review_received",
      title: `New ${input.rating}★ review`,
      message: `${salon.name} received a new review: "${input.comment.slice(0, 80)}"`,
      link: "/salon-dashboard/reviews",
    });
  }

  return review;
}

export async function reviewAction(
  reviewId: string,
  actor: { id: string; role: UserRole; salonId?: string },
  input: ReviewActionInput
): Promise<IReview> {
  await connectDB();

  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError("Review not found.", 404);

  switch (input.action) {
    case "reply": {
      const isOwnerOfSalon =
        (actor.role === "owner" || actor.role === "staff") &&
        actor.salonId === review.salon.toString();
      if (!isOwnerOfSalon && actor.role !== "admin") {
        throw new ApiError("Only the salon owner can reply to reviews.", 403);
      }
      if (!input.reply) throw new ApiError("Reply text is required.");
      review.reply = { text: input.reply, repliedAt: new Date() };
      await notify({
        userId: review.customer.toString(),
        type: "review_reply",
        title: "The salon replied to your review",
        message: input.reply.slice(0, 120),
        link: "/dashboard/reviews",
      });
      break;
    }

    case "helpful": {
      const uid = actor.id;
      const has = review.helpfulVotes.some((v) => v.toString() === uid);
      if (has) {
        review.helpfulVotes = review.helpfulVotes.filter(
          (v) => v.toString() !== uid
        );
      } else {
        review.helpfulVotes.push(new Types.ObjectId(uid));
      }
      break;
    }

    case "report": {
      const alreadyReported = review.reports.some(
        (r) => r.by.toString() === actor.id
      );
      if (!alreadyReported) {
        review.reports.push({
          by: new Types.ObjectId(actor.id),
          reason: input.reportReason,
          reportedAt: new Date(),
        });
      }
      break;
    }

    case "hide":
    case "publish": {
      if (actor.role !== "admin") {
        throw new ApiError("Only admins can moderate reviews.", 403);
      }
      review.status = input.action === "hide" ? "hidden" : "published";
      break;
    }
  }

  await review.save();

  if (input.action === "hide" || input.action === "publish") {
    await recalcSalonRating(review.salon.toString());
  }

  return review;
}
