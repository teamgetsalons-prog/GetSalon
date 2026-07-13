"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { StarPicker } from "@/components/ui/star-rating";

export function CommentForm({
  salonId,
  salonName,
  onCommentAdded,
}: {
  salonId: string;
  salonName: string;
  onCommentAdded: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (comment.trim().length < 3) {
      setError("Please write at least 3 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api("/api/comments", {
        method: "POST",
        json: {
          salonId,
          rating,
          comment: comment.trim(),
        },
      });

      if (res.success) {
        setSuccess(true);
        setRating(0);
        setComment("");
        onCommentAdded();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.message || "Failed to submit review");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-line bg-card p-5">
        <h3 className="text-sm font-semibold text-fg">Write a Review</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Share your experience at {salonName}
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-bg-soft p-6 text-center">
          <LogIn className="h-8 w-8 text-fg-faint" />
          <p className="text-sm text-fg-muted">
            Please log in to write a review
          </p>
          <button
            onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)}
            className="flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-gold-950 transition-colors hover:bg-gold-400"
          >
            <LogIn className="h-4 w-4" />
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <h3 className="text-sm font-semibold text-fg">Write a Review</h3>
      <p className="mt-1 text-xs text-fg-muted">
        Share your experience at {salonName}
      </p>

      {success && (
        <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          Thank you! Your review has been submitted.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-fg-muted">
            Your Rating
          </label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div>
          <label htmlFor="comment" className="mb-2 block text-xs font-medium text-fg-muted">
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience..."
            rows={4}
            className="w-full rounded-xl border border-line bg-bg-soft px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 py-3 text-sm font-semibold text-gold-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
