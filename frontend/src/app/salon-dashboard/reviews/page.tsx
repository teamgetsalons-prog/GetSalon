import { redirect } from "next/navigation";
import { getServerSession, serverFetch } from "@/lib/server-api";
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

  const res = await serverFetch<ReviewApiRow[]>(
    `/reviews?salonId=${session.salonId}&limit=50`
  );

  const rows: SalonReviewRow[] = (res.data ?? []).map((r) => ({
    _id: String(r._id),
    rating: r.rating,
    comment: r.comment,
    customerName: r.customer?.name ?? "Customer",
    customerAvatar: r.customer?.avatar,
    staffName: r.staff?.name,
    reply: r.reply?.text,
    createdAt: r.createdAt,
  }));

  return <ReviewsManager initial={rows} />;
}
