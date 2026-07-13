"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquareReply, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

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
  ownerReply?: string;
}

export function CommentCard({
  comment,
  onDelete,
  isSalonOwner,
  onReplyChange,
}: {
  comment: CommentData;
  onDelete?: (id: string) => void;
  isSalonOwner?: boolean;
  onReplyChange?: (id: string, reply: string | null) => void;
}) {
  const [helpful, setHelpful] = useState(comment.helpfulCount);
  const [voted, setVoted] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState(comment.ownerReply ?? "");
  const [savingReply, setSavingReply] = useState(false);

  async function voteHelpful() {
    const res = await api<{ helpfulCount: number; voted: boolean }>(
      `/api/comments/${comment._id}/helpful`,
      { method: "POST" }
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

  function startReply() {
    setReplyText(comment.ownerReply ?? "");
    setReplying(true);
  }

  async function postReply() {
    if (replyText.trim().length < 2) return;
    setSavingReply(true);
    const res = await api(`/api/comments/${comment._id}/reply`, {
      method: "PATCH",
      json: { reply: replyText.trim() },
    });
    setSavingReply(false);
    if (res.success) {
      setReplying(false);
      onReplyChange?.(comment._id, replyText.trim());
    }
  }

  async function deleteReply() {
    if (!confirm("Remove your reply to this review?")) return;
    const res = await api(`/api/comments/${comment._id}/reply`, {
      method: "DELETE",
    });
    if (res.success) {
      onReplyChange?.(comment._id, null);
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

      {/* Owner reply */}
      {replying ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={savingReply}
              disabled={replyText.trim().length < 2}
              onClick={postReply}
            >
              Post Reply
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : comment.ownerReply ? (
        <div className="mt-3 rounded-xl bg-bg-soft p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gold">
              <MessageSquareReply className="h-3.5 w-3.5" /> Owner Reply
            </span>
            {isSalonOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={startReply}
                  aria-label="Edit reply"
                  className="cursor-pointer text-fg-faint transition-colors hover:text-gold"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={deleteReply}
                  aria-label="Delete reply"
                  className="cursor-pointer text-fg-faint transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          <p className="mt-1.5 text-sm text-fg-muted">{comment.ownerReply}</p>
        </div>
      ) : (
        isSalonOwner && (
          <Button size="sm" variant="outline" className="mt-3" onClick={startReply}>
            <MessageSquareReply className="h-3.5 w-3.5" /> Reply
          </Button>
        )
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
