import { redirect } from "next/navigation";
import { getServerSession, serverFetch, getSalonComments } from "@/lib/server-api";
import {
  ReviewsManager,
  type SalonReviewRow,
} from "@/components/dashboard/reviews-manager";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

interface ReviewApiRow {
  _id: string;
  rating: number;
  comment: string;
  customer?: { name?: string; avatar?: string };
  staff?: { name?: string };
  reply?: { text?: string };
  createdAt: string;
}

export default async function SalonReviewsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/reviews");
  if (!session.salonId) return <NoSalonYet />;

  // Two separate review systems feed this page: booking-verified `Review`s
  // (gated on a completed appointment) and public `Comment`s (the ones shown
  // on the salon page, left with or without ever booking) - owners want to
  // see both in one place, not just the booking-verified subset.
  const [reviewsRes, commentsRes] = await Promise.all([
    serverFetch<ReviewApiRow[]>(`/reviews?salonId=${session.salonId}&limit=50`),
    getSalonComments(session.salonId, 1, 50),
  ]);

  const reviewRows: SalonReviewRow[] = (reviewsRes.data ?? []).map((r) => ({
    _id: String(r._id),
    source: "review",
    rating: r.rating,
    comment: r.comment,
    customerName: r.customer?.name ?? "Customer",
    customerAvatar: r.customer?.avatar,
    staffName: r.staff?.name,
    reply: r.reply?.text,
    createdAt: r.createdAt,
  }));

  const commentRows: SalonReviewRow[] = commentsRes.comments.map((c) => ({
    _id: c._id,
    source: "comment",
    rating: c.rating,
    comment: c.comment,
    customerName: c.customer?.name ?? "Customer",
    customerAvatar: c.customer?.image,
    reply: c.ownerReply,
    createdAt: c.createdAt,
  }));

  const rows = [...reviewRows, ...commentRows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return <ReviewsManager initial={rows} />;
}
