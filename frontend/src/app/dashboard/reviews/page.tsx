import Link from "next/link";
// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/misc";

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const session = await auth();

  type Row = {
    _id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    salonName: string;
    salonSlug: string;
    reply?: string;
  };

  let rows: Row[] = [];
  try {
    await connectDB();
    const reviews = await Review.find({ customer: session?.user?.id })
      .populate("salon", "name slug")
      .sort({ createdAt: -1 })
      .limit(50);

    rows = reviews.map((r) => {
      const salon = r.salon as unknown as { name?: string; slug?: string };
      return {
        _id: r._id.toString(),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        salonName: salon?.name ?? "Salon",
        salonSlug: salon?.slug ?? "",
        reply: r.reply?.text,
      };
    });
  } catch {
    rows = [];
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Reviews you&apos;ve written</h2>
      {rows.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          hint="After a completed visit, you can rate the salon from My Bookings."
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
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row._id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/salon/${row.salonSlug}`}
                  className="text-sm font-semibold hover:text-gold"
                >
                  {row.salonName}
                </Link>
                <StarRating value={row.rating} />
              </div>
              <p className="mt-2 text-sm text-fg-muted">{row.comment}</p>
              {row.reply && (
                <p className="mt-3 rounded-xl bg-bg-soft p-3 text-xs text-fg-muted">
                  <span className="font-semibold text-gold">Salon replied: </span>
                  {row.reply}
                </p>
              )}
              <p className="mt-2 text-xs text-fg-faint">
                {row.createdAt.toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
