"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { Check, Flag, X } from "lucide-react";

interface PendingComment {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reportedBy: string[];
  customer?: { name: string; email: string } | null;
  salon?: { name: string; slug: string } | null;
}

export default function AdminReviewsPage() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api<PendingComment[]>("/api/comments/admin/pending");
    setComments(res.success && res.data ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function moderate(comment: PendingComment, status: "approved" | "rejected") {
    setBusy(comment._id);
    await api(`/api/comments/${comment._id}/moderate`, {
      method: "PATCH",
      json: { status },
    });
    setBusy(null);
    void load();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">Reported Reviews</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Reviews are live the moment a customer posts them. A review only lands
          here after enough different users report it — approve to put it back
          live, or reject to keep it hidden for good.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <EmptyState
          title="Nothing to review"
          hint="Reported reviews will show up here once they cross the report threshold."
        />
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-2xl border border-line bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-fg">
                      {comment.customer?.name ?? "Deleted user"}
                    </p>
                    <StarRating value={comment.rating} />
                  </div>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {comment.salon ? comment.salon.name : "Salon no longer exists"} ·{" "}
                    {new Date(comment.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                    <Flag className="h-3.5 w-3.5" />
                    Reported by {comment.reportedBy.length} user{comment.reportedBy.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => void moderate(comment, "approved")}
                    disabled={busy === comment._id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-emerald-600 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 disabled:opacity-50 dark:text-emerald-400"
                    title="Approve — put back live"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => void moderate(comment, "rejected")}
                    disabled={busy === comment._id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-red-500 transition-colors hover:border-red-500/50 hover:bg-red-500/10 disabled:opacity-50"
                    title="Reject — keep hidden"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-fg-muted">{comment.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
