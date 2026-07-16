"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock,
  CreditCard,
  GitBranch,
  Heart,
  Images,
  LayoutDashboard,
  ListTree,
  LogOut,
  MapPin,
  MessageCircle,
  Scissors,
  Settings,
  Star,
  Store,
  Tag,
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
  "git-branch": GitBranch,
  "list-tree": ListTree,
  tag: Tag,
  "map-pin": MapPin,
  "message-circle": MessageCircle,
  wallet: Wallet,
  "bar-chart": BarChart3,
  "credit-card": CreditCard,
  "book-open": BookOpen,
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
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  // Attention counts (pending bookings, open support messages, ...) keyed
  // by nav href. Refetched on navigation and every minute so the pills
  // stay current without a reload.
  const [badges, setBadges] = useState<Record<string, number>>({});
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const res = await api<Record<string, number>>("/api/badges");
      if (alive && res.success && res.data) setBadges(res.data);
    };
    void load();
    const timer = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [pathname]);

  const badgeFor = (item: NavItem) => badges[item.href] ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to website
        </Link>
        <button
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-500/50 hover:bg-red-500/10 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" /> {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
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
              {badgeFor(item) > 0 && <CountPill count={badgeFor(item)} />}
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
                {badgeFor(item) > 0 && (
                  <span className="ml-auto">
                    <CountPill count={badgeFor(item)} />
                  </span>
                )}
              </Link>
            );
          })}
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

/** Small attention-count pill shown next to a nav label. */
function CountPill({ count }: { count: number }) {
  return (
    <span
      aria-label={`${count} needing attention`}
      className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold leading-none text-gold-950"
    >
      {count > 99 ? "99+" : count}
    </span>
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
