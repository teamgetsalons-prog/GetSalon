"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPKR } from "@getsalons/shared/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { Input, Textarea } from "@/components/ui/input";
import { Tag, Plus, Pencil, Trash2, Eye, EyeOff, Star, X } from "lucide-react";

interface Deal {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  serviceName?: string;
  image?: string;
  terms?: string;
  maxRedemptions?: number;
  redemptionCount: number;
  isActive: boolean;
  isFeatured: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface ServiceOption {
  _id: string;
  name: string;
  price: number;
}

interface DealsManagerProps {
  salonId: string;
}

export function DealsManager({ salonId }: DealsManagerProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [dealPrice, setDealPrice] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [image, setImage] = useState("");
  const [terms, setTerms] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDeals = useCallback(async () => {
    const res = await api<Deal[]>("/api/deals/owner/mine");
    setDeals(res.success && res.data ? res.data : []);
    setLoading(false);
  }, []);

  const loadServices = useCallback(async () => {
    const res = await api<ServiceOption[]>(`/api/services?salonId=${salonId}&all=1`);
    if (res.success && res.data) setServices(res.data);
  }, [salonId]);

  useEffect(() => {
    void loadDeals();
    void loadServices();
  }, [loadDeals, loadServices]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setOriginalPrice("");
    setDealPrice("");
    setServiceId("");
    setImage("");
    setTerms("");
    setMaxRedemptions("");
    setStartDate("");
    setEndDate("");
    setEditingDeal(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(deal: Deal) {
    setTitle(deal.title);
    setDescription(deal.description);
    setOriginalPrice(String(deal.originalPrice));
    setDealPrice(String(deal.dealPrice));
    setServiceId("");
    setImage(deal.image ?? "");
    setTerms(deal.terms ?? "");
    setMaxRedemptions(deal.maxRedemptions ? String(deal.maxRedemptions) : "");
    setStartDate(deal.startDate ?? "");
    setEndDate(deal.endDate ?? "");
    setEditingDeal(deal);
    setShowForm(true);
  }

  async function handleSave() {
    const orig = Number(originalPrice);
    const deal = Number(dealPrice);
    if (!title.trim() || !description.trim() || isNaN(orig) || isNaN(deal)) {
      window.alert("Please fill in all required fields.");
      return;
    }
    if (deal >= orig) {
      window.alert("Deal price must be less than original price.");
      return;
    }

    setSaving(true);
    const body = {
      title: title.trim(),
      description: description.trim(),
      originalPrice: orig,
      dealPrice: deal,
      serviceId: serviceId || undefined,
      image: image || undefined,
      terms: terms || undefined,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    let res;
    if (editingDeal) {
      res = await api(`/api/deals/${editingDeal._id}`, { method: "PATCH", json: body });
    } else {
      res = await api<{ id: string }>("/api/deals", { method: "POST", json: body });
    }

    setSaving(false);
    if (res.success) {
      setShowForm(false);
      resetForm();
      void loadDeals();
    } else {
      window.alert(res.message ?? "Failed to save deal.");
    }
  }

  async function toggleDeal(deal: Deal, field: "isActive" | "isFeatured") {
    setBusy(deal._id);
    await api(`/api/deals/${deal._id}/toggle`, {
      method: "PATCH",
      json: { field },
    });
    setBusy(null);
    void loadDeals();
  }

  async function deleteDeal(deal: Deal) {
    if (!window.confirm(`Delete "${deal.title}"? This cannot be undone.`)) return;
    setBusy(deal._id);
    const res = await api(`/api/deals/${deal._id}`, { method: "DELETE" });
    setBusy(null);
    if (res.success) void loadDeals();
    else window.alert(res.message ?? "Could not delete.");
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Deals & Offers</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Create discount deals to attract more customers
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-gold-950 transition-colors hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" /> New Deal
        </button>
      </div>

      {/* Deal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">
                {editingDeal ? "Edit Deal" : "Create New Deal"}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-fg-muted hover:text-fg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-fg">Deal Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 30% Off Hair Color" maxLength={120} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-fg">Description *</label>
                <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="Describe the deal..." maxLength={500} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Original Price (PKR) *</label>
                  <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="5000" min={0} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Deal Price (PKR) *</label>
                  <Input type="number" value={dealPrice} onChange={(e) => setDealPrice(e.target.value)} placeholder="3500" min={0} />
                </div>
              </div>

              {originalPrice && dealPrice && Number(originalPrice) > Number(dealPrice) && (
                <p className="text-sm text-green-500">
                  {Math.round(((Number(originalPrice) - Number(dealPrice)) / Number(originalPrice)) * 100)}% discount — save {formatPKR(Number(originalPrice) - Number(dealPrice))}
                </p>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-fg">Link to Service (optional)</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-fg"
                >
                  <option value="">No linked service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} — {formatPKR(s.price)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-fg">Deal Image URL (optional)</label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-fg">Terms & Conditions (optional)</label>
                <Textarea value={terms} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTerms(e.target.value)} placeholder="e.g. Valid on weekdays only" maxLength={500} rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Start Date</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">End Date</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-fg">Max Redemptions (optional)</label>
                <Input type="number" value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} placeholder="Unlimited" min={1} />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => { setShowForm(false); resetForm(); }} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving} className="flex-1 bg-gold-500 text-gold-950 hover:bg-gold-400">
                {saving ? "Saving..." : editingDeal ? "Update Deal" : "Create Deal"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deals List */}
      {deals.length === 0 ? (
        <EmptyState
          title="No deals yet"
          hint="Create your first deal to attract customers with special offers."
        />
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <div
              key={deal._id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-4 sm:p-5"
            >
              {deal.image && (
                <span className="hidden h-16 w-20 shrink-0 overflow-hidden rounded-xl sm:block">
                  <img src={deal.image} alt="" className="h-full w-full object-cover" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-fg">{deal.title}</p>
                  <Badge variant={deal.isActive ? "success" : "neutral"}>
                    {deal.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {deal.isFeatured && <Badge variant="gold">Featured</Badge>}
                </div>
                <p className="mt-1 text-xs text-fg-muted line-clamp-1">{deal.description}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
                  <span className="font-semibold text-green-500">{deal.discountPercent}% OFF</span>
                  <span className="text-fg-faint line-through">{formatPKR(deal.originalPrice)}</span>
                  <span className="font-bold text-gold">{formatPKR(deal.dealPrice)}</span>
                  {deal.serviceName && <span>Via: {deal.serviceName}</span>}
                  {deal.maxRedemptions && <span>{deal.redemptionCount}/{deal.maxRedemptions} claimed</span>}
                  {deal.endDate && <span>Ends {deal.endDate}</span>}
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
                  onClick={() => openEdit(deal)}
                  disabled={busy === deal._id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold disabled:opacity-50"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
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
