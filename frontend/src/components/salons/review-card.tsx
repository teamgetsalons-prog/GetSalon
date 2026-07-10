"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquareReply, ThumbsUp } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar } from "@/components/ui/misc";

export interface ReviewCardData {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  photos: string[];
  customerName: string;
  customerAvatar?: string;
  staffName?: string;
  reply?: { text: string; repliedAt: string };
  helpfulCount: number;
  createdAt: string;
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [voted, setVoted] = useState(false);

  async function voteHelpful() {
    const res = await api<{ helpfulCount: number }>(
      `/api/reviews/${review._id}`,
      { method: "PATCH", json: { action: "helpful" } }
    );
    if (res.success && res.data) {
      setHelpful(res.data.helpfulCount);
      setVoted((v) => !v);
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={review.customerAvatar} name={review.customerName} size={38} />
          <div>
            <p className="text-sm font-semibold text-fg">{review.customerName}</p>
            <p className="text-xs text-fg-faint">
              {new Date(review.createdAt).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {review.staffName ? ` · with ${review.staffName}` : ""}
            </p>
          </div>
        </div>
        <StarRating value={review.rating} />
      </div>

      {review.title && (
        <p className="mt-3 text-sm font-semibold text-fg">{review.title}</p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
        {review.comment}
      </p>

      {review.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.photos.slice(0, 4).map((photo) => (
            <span
              key={photo}
              className="relative h-16 w-16 overflow-hidden rounded-lg"
            >
              <Image src={photo} alt="Review photo" fill className="object-cover" sizes="64px" />
            </span>
          ))}
        </div>
      )}

      {review.reply && (
        <div className="mt-4 rounded-xl bg-bg-soft p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-gold">
            <MessageSquareReply className="h-3.5 w-3.5" /> Response from the salon
          </p>
          <p className="mt-1.5 text-sm text-fg-muted">{review.reply.text}</p>
        </div>
      )}

      <button
        onClick={voteHelpful}
        className={cn(
          "mt-4 flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors",
          voted ? "text-gold" : "text-fg-faint hover:text-fg-muted"
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        Helpful{helpful > 0 ? ` (${helpful})` : ""}
      </button>
    </article>
  );
}
