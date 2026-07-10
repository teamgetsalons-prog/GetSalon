import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-api";
import { EmptyState } from "@/components/ui/misc";

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/dashboard/reviews");

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Reviews you&apos;ve written</h2>
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
    </div>
  );
}
