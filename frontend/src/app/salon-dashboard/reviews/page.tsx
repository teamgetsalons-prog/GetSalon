// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import {
  ReviewsManager,
  type SalonReviewRow,
} from "@/components/dashboard/reviews-manager";
import { NoSalonYet } from "@/components/dashboard/no-salon";

export const dynamic = "force-dynamic";

export default async function SalonReviewsPage() {
  const session = await auth();
  if (!session?.user) return null;

  let salon = null;
  let rows: SalonReviewRow[] = [];
  try {
    await connectDB();
    salon = await getActorSalon(session.user);
    if (salon) {
      const reviews = await Review.find({
        salon: salon._id,
        status: "published",
      })
        .populate("customer", "name avatar")
        .populate("staff", "name")
        .sort({ createdAt: -1 })
        .limit(100);

      rows = reviews.map((r) => {
        const customer = r.customer as unknown as { name?: string; avatar?: string };
        const staff = r.staff as unknown as { name?: string } | undefined;
        return {
          _id: r._id.toString(),
          rating: r.rating,
          comment: r.comment,
          customerName: customer?.name ?? "Customer",
          customerAvatar: customer?.avatar,
          staffName: staff?.name,
          reply: r.reply?.text,
          createdAt: r.createdAt.toISOString(),
        };
      });
    }
  } catch {
    salon = null;
  }
  if (!salon) return <NoSalonYet />;

  return <ReviewsManager initial={rows} />;
}
