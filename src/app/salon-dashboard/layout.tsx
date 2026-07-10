import type { Metadata } from "next";
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
  { href: "/salon-dashboard/settings", label: "Settings", icon: "settings" },
];

export default function SalonDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Salon Dashboard" items={items}>
      {children}
    </DashboardShell>
  );
}
