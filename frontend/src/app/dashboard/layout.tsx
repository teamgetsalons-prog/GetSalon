import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-api";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: "My Dashboard",
  robots: { index: false },
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "layout-dashboard", exact: true },
  { href: "/dashboard/bookings", label: "My Bookings", icon: "calendar" },
  { href: "/dashboard/favorites", label: "Favourites", icon: "heart" },
  { href: "/dashboard/reviews", label: "My Reviews", icon: "star" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth alongside the middleware gate.
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/dashboard");

  return (
    <DashboardShell title="My Dashboard" items={items}>
      {children}
    </DashboardShell>
  );
}
