import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-api";
import { UnderDevelopment } from "@/components/dashboard/under-development";

export const metadata: Metadata = {
  title: "Add a branch",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

// Gated with the rest of the branching system (see ../page.tsx). The
// backend's createSalon also rejects a second salon per account, so this
// page being blocked isn't the only line of defense.
export default async function NewBranchPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard");

  return <UnderDevelopment feature="Branch management" />;
}
