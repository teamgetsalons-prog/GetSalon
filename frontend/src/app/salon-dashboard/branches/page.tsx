import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-api";
import { UnderDevelopment } from "@/components/dashboard/under-development";

export const dynamic = "force-dynamic";

// Branch management is temporarily gated off while the feature is being
// finished — the nav item is disabled, and this page (plus /new and the
// second-salon API path) shows the same under-development notice so a
// direct URL can't bypass the gate. Restore the previous BranchList
// rendering here when branching launches.
export default async function BranchesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard");

  return <UnderDevelopment feature="Branch management" />;
}
