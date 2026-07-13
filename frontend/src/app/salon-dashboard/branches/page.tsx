import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Store } from "lucide-react";
import { getMySalonsApi, getServerSession } from "@/lib/server-api";
import { BranchList } from "@/components/dashboard/branch-list";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard/branches");

  const branches = await getMySalonsApi();

  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line py-20 text-center">
        <Store className="h-10 w-10 text-gold" />
        <div>
          <p className="font-semibold">You haven&apos;t created your salon profile yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">
            Set up your first branch in 10 minutes and start receiving online bookings.
          </p>
        </div>
        <Link href="/salon-dashboard/branches/new">
          <Button>
            <Plus className="h-4 w-4" /> Create salon profile
          </Button>
        </Link>
      </div>
    );
  }

  return <BranchList branches={branches} activeSalonId={session.salonId} />;
}
