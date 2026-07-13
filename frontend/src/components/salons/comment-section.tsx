"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { CommentCard, type CommentData } from "./comment-card";
import { CommentForm } from "./comment-form";
import { StarRating } from "@/components/ui/star-rating";

export function CommentSection({
  salonId,
  salonName,
  rating,
  currentUserId,
}: {
  salonId: string;
  salonName: string;
  rating: { average: number; count: number };
  currentUserId?: string;
}) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchComments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const res = await api<CommentData[]>(
          `/api/comments?salonId=${salonId}&page=${pageNum}&limit=10`
        );
        if (res.success && res.data) {
          const newComments = res.data.map((c: any) => ({
            ...c,
            customerName: c.customer?.name || "User",
            customerAvatar: c.customer?.image,
            helpfulCount: c.helpfulVotes?.length || 0,
            isOwner: currentUserId && c.customer?._id === currentUserId,
          }));
          if (append) {
            setComments((prev) => [...prev, ...newComments]);
          } else {
            setComments(newComments);
          }
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [salonId, currentUserId]
  );

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  function handleLoadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  }

  function handleCommentAdded() {
    setPage(1);
    fetchComments(1);
  }

  function handleDelete(id: string) {
    setComments((prev) => prev.filter((c) => c._id !== id));
  }

  // Rating distribution (simplified)
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percentage: rating.count > 0 ? Math.round((rating.count / rating.count) * 100) : 0,
  }));

  return (
    <section id="reviews" className="space-y-6">
      {/* Rating Summary */}
      <div className="rounded-2xl border border-line bg-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="text-center sm:text-left">
            <p className="font-display text-4xl font-bold text-fg">
              {rating.average > 0 ? rating.average.toFixed(1) : "—"}
            </p>
            <div className="mt-1">
              <StarRating value={rating.average} size={18} />
            </div>
            <p className="mt-1 text-xs text-fg-faint">
              {rating.count} review{rating.count !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ stars }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-3 text-xs text-fg-faint">{stars}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-soft">
                  <div
                    className="h-full rounded-full bg-gold-400"
                    style={{
                      width: rating.count > 0 ? `${Math.round(((rating.count - (5 - stars) * Math.floor(rating.count / 5)) / rating.count) * 100)}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <CommentForm
        salonId={salonId}
        salonName={salonName}
        onCommentAdded={handleCommentAdded}
      />

      {/* Comments List */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5 text-gold" />
          Reviews & Comments
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-8 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-fg-faint" />
            <p className="mt-3 text-sm text-fg-muted">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                onDelete={handleDelete}
              />
            ))}

            {page < totalPages && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-medium text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load More Reviews"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
