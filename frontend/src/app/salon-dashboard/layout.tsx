import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-api";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: "Salon Dashboard",
  robots: { index: false },
};

const items: NavItem[] = [
  { href: "/salon-dashboard", label: "Overview", icon: "layout-dashboard", exact: true },
  { href: "/salon-dashboard/bookings", label: "Bookings", icon: "calendar" },
  { href: "/salon-dashboard/services", label: "Services", icon: "scissors" },
  { href: "/salon-dashboard/staff", label: "Staff", icon: "users" },
  { href: "/salon-dashboard/reviews", label: "Reviews", icon: "star" },
  { href: "/salon-dashboard/hours", label: "Working Hours", icon: "clock" },
  { href: "/salon-dashboard/gallery", label: "Gallery", icon: "images" },
  { href: "/salon-dashboard/analytics", label: "Analytics", icon: "bar-chart" },
  { href: "/salon-dashboard/subscription", label: "Subscription", icon: "credit-card" },
  { href: "/salon-dashboard/support", label: "Contact Admin", icon: "message-circle" },
  { href: "/salon-dashboard/settings", label: "Settings", icon: "settings" },
];

export default async function SalonDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth alongside the middleware gate.
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard");
  if (!["owner", "staff", "admin"].includes(session.role)) redirect("/dashboard");

  return (
    <DashboardShell title="Salon Dashboard" items={items}>
      {children}
    </DashboardShell>
  );
}
