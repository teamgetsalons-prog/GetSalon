"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPKR } from "@getsalons/shared/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { Trash2, Star, Eye, EyeOff } from "lucide-react";

interface AdminDeal {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  serviceName?: string;
  isActive: boolean;
  isFeatured: boolean;
  redemptionCount: number;
  maxRedemptions?: number;
  endDate?: string;
  createdAt: string;
  /** Nullable: the salon may have been deleted after the deal was created */
  salon?: { _id: string; name: string; slug: string; cityName: string } | null;
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<AdminDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api<AdminDeal[]>("/api/deals/admin/all");
    setDeals(res.success && res.data ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleDeal(deal: AdminDeal, field: "isActive" | "isFeatured") {
    setBusy(deal._id);
    await api(`/api/deals/${deal._id}/admin-toggle`, {
      method: "PATCH",
      json: { field },
    });
    setBusy(null);
    void load();
  }

  async function deleteDeal(deal: AdminDeal) {
    if (!window.confirm(`Delete "${deal.title}"? This cannot be undone.`)) return;
    setBusy(deal._id);
    const res = await api(`/api/deals/${deal._id}/admin`, { method: "DELETE" });
    setBusy(null);
    if (res.success) void load();
    else window.alert(res.message ?? "Could not delete.");
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">All Deals</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Manage deals across all salons
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : deals.length === 0 ? (
        <EmptyState
          title="No deals yet"
          hint="Salon owners can create deals from their dashboard."
        />
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <div
              key={deal._id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-4 sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-fg">{deal.title}</p>
                  <Badge variant={deal.isActive ? "success" : "neutral"}>
                    {deal.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {deal.isFeatured && <Badge variant="gold">Featured</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-fg-muted">
                  {deal.salon
                    ? `${deal.salon.name} · ${deal.salon.cityName}`
                    : "Salon no longer exists — safe to delete this deal"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
                  <span className="font-semibold text-green-500">{deal.discountPercent}% OFF</span>
                  <span className="text-fg-faint line-through">{formatPKR(deal.originalPrice)}</span>
                  <span className="font-bold text-gold">{formatPKR(deal.dealPrice)}</span>
                  {deal.serviceName && <span>Linked: {deal.serviceName}</span>}
                  {deal.maxRedemptions && <span>{deal.redemptionCount}/{deal.maxRedemptions} claimed</span>}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => void toggleDeal(deal, "isActive")}
                  disabled={busy === deal._id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold disabled:opacity-50"
                  title={deal.isActive ? "Deactivate" : "Activate"}
                >
                  {deal.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => void toggleDeal(deal, "isFeatured")}
                  disabled={busy === deal._id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold disabled:opacity-50"
                  title={deal.isFeatured ? "Unfeature" : "Feature"}
                >
                  <Star className={`h-3.5 w-3.5 ${deal.isFeatured ? "fill-gold text-gold" : ""}`} />
                </button>
                <button
                  onClick={() => void deleteDeal(deal)}
                  disabled={busy === deal._id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-red-500 transition-colors hover:border-red-500/50 hover:bg-red-500/10 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
