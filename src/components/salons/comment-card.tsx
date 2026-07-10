"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar } from "@/components/ui/misc";

export interface CommentData {
  _id: string;
  rating: number;
  comment: string;
  photos: string[];
  customerName: string;
  customerAvatar?: string;
  helpfulCount: number;
  createdAt: string;
  isOwner?: boolean;
}

export function CommentCard({
  comment,
  onDelete,
}: {
  comment: CommentData;
  onDelete?: (id: string) => void;
}) {
  const [helpful, setHelpful] = useState(comment.helpfulCount);
  const [voted, setVoted] = useState(false);

  async function voteHelpful() {
    const res = await api<{ helpfulCount: number; voted: boolean }>(
      `/api/comments/${comment._id}`,
      { method: "PATCH", json: { action: "helpful" } }
    );
    if (res.success && res.data) {
      setHelpful(res.data.helpfulCount);
      setVoted(res.data.voted);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const res = await api(`/api/comments/${comment._id}`, {
      method: "DELETE",
    });
    if (res.success && onDelete) {
      onDelete(comment._id);
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={comment.customerAvatar} name={comment.customerName} size={38} />
          <div>
            <p className="text-sm font-semibold text-fg">{comment.customerName}</p>
            <p className="text-xs text-fg-faint">
              {new Date(comment.createdAt).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={comment.rating} />
          {comment.isOwner && onDelete && (
            <button
              onClick={handleDelete}
              className="cursor-pointer text-fg-faint transition-colors hover:text-red-500"
              aria-label="Delete review"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-fg-muted">{comment.comment}</p>

      {comment.photos && comment.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {comment.photos.slice(0, 4).map((photo) => (
            <span
              key={photo}
              className="relative h-16 w-16 overflow-hidden rounded-lg"
            >
              <Image src={photo} alt="Review photo" fill className="object-cover" sizes="64px" />
            </span>
          ))}
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
