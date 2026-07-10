"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  AlertTriangle,
  Clock,
  Crown,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Spinner } from "@/components/ui/misc";

interface SubscriptionRow {
  _id: string;
  salon: { name: string; slug: string } | string;
  plan: string;
  status: string;
  startDate: string;
  expiryDate: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

interface Analytics {
  total: number;
  active: number;
  expired: number;
  suspended: number;
  trial: number;
  basic: number;
  premium: number;
}

const planTabs = [
  { value: "trial", label: "Trial", icon: Clock },
  { value: "basic", label: "Basic", icon: Zap },
  { value: "premium", label: "Premium", icon: Crown },
];

const statusVariant = {
  active: "success",
  expired: "danger",
  suspended: "warning",
  trial: "warning",
  paid: "success",
  pending: "neutral",
  failed: "danger",
} as const;

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (planFilter) params.set("plan", planFilter);
    if (statusFilter) params.set("status", statusFilter);

    const [subRes, analyticsRes] = await Promise.all([
      api<{ subscriptions: SubscriptionRow[]; total: number; totalPages: number }>(
        `/api/admin/subscriptions?${params}`
      ),
      api<Analytics>("/api/admin/subscriptions?analytics=true"),
    ]);

    if (subRes.success && subRes.data) {
      setSubscriptions(subRes.data.subscriptions);
      setTotalPages(subRes.data.totalPages);
    }
    if (analyticsRes.success && analyticsRes.data) {
      setAnalytics(analyticsRes.data);
    }
    setLoading(false);
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(action: string, salonId: string, extra?: Record<string, unknown>) {
    setBusy(salonId);
    const body = { salonId, ...extra };
    await api("/api/admin/subscriptions", { method: "PATCH", json: body });
    load();
    setBusy(null);
  }

  function getSalonName(row: SubscriptionRow): string {
    if (typeof row.salon === "object" && row.salon?.name) return row.salon.name;
    return "Unknown Salon";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Subscriptions</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Manage salon subscription plans and billing
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold-500/10 p-2">
                <CreditCard className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-fg">{analytics.active}</p>
                <p className="text-xs text-fg-muted">Active Subscriptions</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-fg">{analytics.trial}</p>
                <p className="text-xs text-fg-muted">On Free Trial</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-fg">{analytics.expired}</p>
                <p className="text-xs text-fg-muted">Expired Subscriptions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Distribution */}
      {analytics && (
        <div className="grid gap-4 sm:grid-cols-3">
          {planTabs.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.value === "trial"
                ? analytics.trial
                : tab.value === "basic"
                  ? analytics.basic
                  : analytics.premium;
            return (
              <div key={tab.value} className="rounded-xl border border-line bg-card p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      tab.value === "trial"
                        ? "bg-amber-500/10"
                        : tab.value === "basic"
                          ? "bg-blue-500/10"
                          : "bg-gold-500/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        tab.value === "trial"
                          ? "text-amber-500"
                          : tab.value === "basic"
                            ? "text-blue-500"
                            : "text-gold"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-fg">{count}</p>
                    <p className="text-xs text-fg-muted">{tab.label} Active</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
          <input
            type="text"
            placeholder="Search salons..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64 rounded-xl border border-line bg-card py-2 pl-10 pr-4 text-sm text-fg placeholder:text-fg-faint focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex gap-1 rounded-xl border border-line bg-card p-1">
          <button
            onClick={() => {
              setPlanFilter(null);
              setPage(1);
            }}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              !planFilter ? "bg-gold text-gold-950" : "text-fg-muted hover:text-fg"
            )}
          >
            All Plans
          </button>
          {planTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setPlanFilter(planFilter === tab.value ? null : tab.value);
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                planFilter === tab.value ? "bg-gold text-gold-950" : "text-fg-muted hover:text-fg"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-xl border border-line bg-card p-1">
          {["active", "expired", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(statusFilter === s ? null : s);
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors",
                statusFilter === s ? "bg-gold text-gold-950" : "text-fg-muted hover:text-fg"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="No subscriptions found"
          hint="No subscriptions match your filters."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-bg-soft/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-faint">
                  Salon
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-faint">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-faint">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-faint">
                  Expiry
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-faint">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-faint">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subscriptions.map((row) => {
                const expiryDate = new Date(row.expiryDate);
                const now = new Date();
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                );

                return (
                  <tr key={row._id} className="hover:bg-bg-soft/30">
                    <td className="px-4 py-3 text-sm font-medium text-fg">
                      {getSalonName(row)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          row.plan === "premium"
                            ? "gold"
                            : row.plan === "basic"
                              ? "success"
                              : "warning"
                        }
                      >
                        {row.plan === "trial" && <Clock className="mr-1 h-3 w-3" />}
                        {row.plan === "premium" && <Crown className="mr-1 h-3 w-3" />}
                        {row.plan.charAt(0).toUpperCase() + row.plan.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          statusVariant[row.status as keyof typeof statusVariant] || "neutral"
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-fg-muted">
                      <div>
                        {expiryDate.toLocaleDateString("en-PK")}
                        {row.status === "active" && daysRemaining <= 7 && (
                          <span className="ml-2 text-xs text-amber-500">
                            ({daysRemaining}d left)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gold">
                      {formatPKR(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {row.plan === "trial" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy === row._id}
                            onClick={() =>
                              handleAction("extend", row._id, { additionalDays: 30 })
                            }
                            className="h-7 text-xs text-gold hover:text-gold-400"
                          >
                            +30d
                          </Button>
                        )}
                        {row.plan !== "premium" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy === row._id}
                            onClick={() => handleAction("upgrade", row._id, { plan: "premium" })}
                            className="h-7 text-xs text-gold hover:text-gold-400"
                          >
                            Premium
                          </Button>
                        )}
                        {row.status !== "suspended" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy === row._id}
                            onClick={() =>
                              handleAction("suspend", row._id, {
                                reason: "Admin suspension",
                              })
                            }
                            className="h-7 text-xs text-red-400 hover:text-red-300"
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-fg-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
