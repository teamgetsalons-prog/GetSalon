import type { Metadata } from "next";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

const items: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "layout-dashboard", exact: true },
  { href: "/admin/salons", label: "Salons", icon: "store" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "credit-card" },
  { href: "/admin/catalog", label: "Cities & Categories", icon: "map-pin" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Admin Console" items={items}>
      {children}
    </DashboardShell>
  );
}
