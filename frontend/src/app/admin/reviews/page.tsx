"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { Check, Flag, Trash2, X } from "lucide-react";

interface AdminComment {
  _id: string;
  rating: number;
  comment: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  reportedBy: string[];
  customer?: { name: string; email: string } | null;
  salon?: { name: string; slug: string } | null;
}

const statusTabs: { value: string; label: string }[] = [
  { value: "reported", label: "Reported" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

export default function AdminReviewsPage() {
  const [status, setStatus] = useState("reported");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (status) params.set("status", status);
    const res = await api<AdminComment[]>(`/api/comments/admin/pending?${params}`);
    setComments(res.success && res.data ? res.data : []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function moderate(comment: AdminComment, next: "approved" | "rejected") {
    setBusy(comment._id);
    await api(`/api/comments/${comment._id}/moderate`, {
      method: "PATCH",
      json: { status: next },
    });
    setBusy(null);
    void load();
  }

  async function remove(comment: AdminComment) {
    if (
      !window.confirm(
        "Permanently delete this review? This removes it everywhere, including the salon's public rating. This cannot be undone."
      )
    ) {
      return;
    }
    setBusy(comment._id);
    const res = await api(`/api/comments/${comment._id}`, { method: "DELETE" });
    setBusy(null);
    if (res.success) void load();
    else window.alert(res.message ?? "Could not delete.");
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">Reviews</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Reviews go live the moment a customer posts them. Any review a
          customer reports lands in the Reported tab, whether it's been
          reported once or many times — approve to confirm it's fine, reject
          or delete if it's genuinely a problem.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              status === t.value
                ? "border-gold-500 bg-gold-500/15 text-gold"
                : "border-line text-fg-muted hover:text-fg"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <EmptyState
          title="No reviews here"
          hint={
            status === "reported"
              ? "Reviews reported by customers will show up here."
              : "Nothing in this category yet."
          }
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
                  {comment.reportedBy.length > 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                      <Flag className="h-3.5 w-3.5" />
                      Reported by {comment.reportedBy.length} user{comment.reportedBy.length === 1 ? "" : "s"}
                      {comment.status === "pending" && " · hidden from public"}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {comment.status !== "approved" && (
                    <button
                      onClick={() => void moderate(comment, "approved")}
                      disabled={busy === comment._id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-emerald-600 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 disabled:opacity-50 dark:text-emerald-400"
                      title="Approve — put live"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {comment.status !== "rejected" && (
                    <button
                      onClick={() => void moderate(comment, "rejected")}
                      disabled={busy === comment._id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-red-500 transition-colors hover:border-red-500/50 hover:bg-red-500/10 disabled:opacity-50"
                      title="Reject — keep hidden"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => void remove(comment)}
                    disabled={busy === comment._id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
