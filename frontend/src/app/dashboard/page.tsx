import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { getServerSession } from "@/lib/server-api";
import { BookingList } from "@/components/dashboard/booking-list";

export const dynamic = "force-dynamic";

export default async function CustomerOverviewPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="space-y-6">
      <div className="relative z-10 rounded-2xl border border-line bg-card p-5">
        <p className="font-display text-lg font-bold">
          Welcome back, {session.name?.split(" ")[0] ?? "there"}! 👋
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          Manage your appointments, favourites and reviews from here.
        </p>
      </div>

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your appointments</h2>
          <Link
            href="/salons"
            className="flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
          >
            <Search className="h-4 w-4" /> Book new
          </Link>
        </div>
        <BookingList role="customer" />
      </div>
    </div>
  );
}
