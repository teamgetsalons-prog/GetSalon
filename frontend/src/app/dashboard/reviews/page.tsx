import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession, serverFetch } from "@/lib/server-api";
import { EmptyState } from "@/components/ui/misc";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

interface ReviewData {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  photos: string[];
  createdAt: string;
  salon: { name: string; slug: string; coverImage?: string } | null;
  staff?: { name: string } | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? "fill-gold-500 text-gold-500" : "text-fg-faint"
          }`}
        />
      ))}
    </div>
  );
}

export default async function MyReviewsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/dashboard/reviews");

  const res = await serverFetch<ReviewData[]>("/reviews/mine");
  const reviews = res.data ?? [];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Reviews you&apos;ve written</h2>

      {reviews.length === 0 ? (
        <EmptyState
          title="Your reviews live with your bookings"
          hint="After a completed visit, rate the salon from My Bookings — your published reviews appear on each salon's page."
          action={
            <Link
              href="/dashboard/bookings"
              className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-gold-950 hover:bg-gold-400"
            >
              Go to my bookings
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-2xl border border-line bg-bg-soft p-5"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  {review.salon && (
                    <Link
                      href={`/salon/${review.salon.slug}`}
                      className="font-semibold text-fg hover:text-gold-500"
                    >
                      {review.salon.name}
                    </Link>
                  )}
                  {review.staff && (
                    <p className="text-xs text-fg-muted">
                      with {review.staff.name}
                    </p>
                  )}
                </div>
                <StarRating rating={review.rating} />
              </div>

              {review.title && (
                <h3 className="mb-1 font-medium text-fg">{review.title}</h3>
              )}

              <p className="text-sm text-fg-muted">{review.comment}</p>

              <p className="mt-2 text-xs text-fg-faint">
                {new Date(review.createdAt).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
