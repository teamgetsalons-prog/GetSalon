import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-api";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: "Salon Dashboard",
  robots: { index: false },
};

const baseItems: NavItem[] = [
  { href: "/salon-dashboard", label: "Overview", icon: "layout-dashboard", exact: true },
  { href: "/salon-dashboard/bookings", label: "Bookings", icon: "calendar" },
  { href: "/salon-dashboard/services", label: "Services", icon: "scissors" },
  { href: "/salon-dashboard/deals", label: "Deals & Offers", icon: "tag" },
  { href: "/salon-dashboard/reviews", label: "Reviews", icon: "star" },
  { href: "/salon-dashboard/hours", label: "Working Hours", icon: "clock" },
  { href: "/salon-dashboard/gallery", label: "Gallery", icon: "images" },
  { href: "/salon-dashboard/analytics", label: "Analytics", icon: "bar-chart" },
  // Subscription tab hidden while GetSalons is free for every salon - the
  // page and its route still exist, just not linked from nav. Re-add this
  // item once paid plans launch (see booking.service.ts's createBooking
  // for the matching enforcement toggle).
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

  // Branch management is an owner-account concept - a single staff
  // member is fixed to the one branch they were added to.
  // The whole branching system is temporarily gated off while it's being
  // finished: the nav item stays visible (so owners know it's coming) but
  // is non-clickable, and the pages + salon-creation API are blocked too.
  const items: NavItem[] =
    session.role === "staff"
      ? baseItems
      : [
          baseItems[0]!,
          {
            href: "/salon-dashboard/branches",
            label: "Branches",
            icon: "store",
            disabled: true,
            disabledNote: "This feature is currently under development",
          },
          ...baseItems.slice(1),
        ];

  return (
    <DashboardShell title="Salon Dashboard" items={items}>
      {children}
    </DashboardShell>
  );
}
