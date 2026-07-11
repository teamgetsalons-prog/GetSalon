"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Clock,
  CreditCard,
  Heart,
  Images,
  LayoutDashboard,
  MapPin,
  Scissors,
  Settings,
  Star,
  Store,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@getsalons/shared/utils";

/**
 * Icons are referenced by NAME (not component) so server layouts/pages can
 * pass them as serializable props across the RSC boundary.
 */
const ICONS = {
  "layout-dashboard": LayoutDashboard,
  calendar: CalendarDays,
  heart: Heart,
  star: Star,
  settings: Settings,
  scissors: Scissors,
  users: Users,
  clock: Clock,
  images: Images,
  store: Store,
  "map-pin": MapPin,
  wallet: Wallet,
  "bar-chart": BarChart3,
  "credit-card": CreditCard,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  exact?: boolean;
}

/**
 * Shared dashboard chrome: sticky sidebar on desktop,
 * horizontal scroll tabs on mobile.
 */
export function DashboardShell({
  title,
  items,
  children,
}: {
  title: string;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link
        href="/"
        className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to website
      </Link>
      <h1 className="font-display mb-5 text-2xl font-bold">{title}</h1>

      {/* Mobile tabs */}
      <nav className="no-scrollbar mb-5 flex gap-2 overflow-x-auto lg:hidden" aria-label="Dashboard">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                isActive(item)
                  ? "border-gold-500 bg-gold-500/15 text-gold"
                  : "border-line text-fg-muted"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-20 hidden h-fit w-56 shrink-0 rounded-2xl border border-line bg-card p-3 lg:block">
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive(item)
                    ? "bg-gold-500/12 text-gold"
                    : "text-fg-muted hover:bg-bg-soft hover:text-fg"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  hint?: string;
}) {
  const Icon = ICONS[icon];
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-fg-faint">
          {label}
        </p>
        <Icon className="h-4 w-4 text-gold" />
      </div>
      <p className="font-display mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-faint">{hint}</p>}
    </div>
  );
}
