import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-api";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

const items: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "layout-dashboard", exact: true },
  { href: "/admin/salons", label: "Salons", icon: "store" },
  { href: "/admin/branches", label: "Branches", icon: "git-branch" },
  { href: "/admin/appointments", label: "Appointments", icon: "calendar" },
  { href: "/admin/details", label: "Details", icon: "list-tree" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/deals", label: "All Deals", icon: "tag" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/blog", label: "Blog Posts", icon: "book-open" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "credit-card" },
  { href: "/admin/support", label: "Support Inbox", icon: "message-circle" },
  { href: "/admin/catalog", label: "Cities & Categories", icon: "map-pin" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: middleware already gates /admin, but the console
  // must never render for a non-admin even if middleware were bypassed
  // or misconfigured.
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.role !== "admin") redirect("/");

  return (
    <DashboardShell title="Admin Console" items={items}>
      {children}
    </DashboardShell>
  );
}
