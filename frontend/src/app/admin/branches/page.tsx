"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ExternalLink, GitBranch, Plus, Settings, Star } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import type { SalonStatus } from "@getsalons/shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { EmptyState, Spinner } from "@/components/ui/misc";

interface SiblingSalon {
  name: string;
  slug: string;
  status: SalonStatus;
}

interface SalonOption {
  _id: string;
  name: string;
  cityName: string;
  status: SalonStatus;
  phone: string;
  ownerId: string;
  ownerName: string;
}

interface CityOption {
  _id: string;
  name: string;
}

const emptyBranchDraft = {
  sourceId: "",
  name: "",
  cityId: "",
  address: "",
  phone: "",
  whatsapp: "",
  email: "",
};

interface AdminBranchRow {
  _id: string;
  name: string;
  slug: string;
  cityName: string;
  phone: string;
  status: SalonStatus;
  isFeatured: boolean;
  isVerified: boolean;
  createdAt: string;
  owner?: { name?: string; email?: string; phone?: string };
  siblingSalons: SiblingSalon[];
}

const statusTabs: { value: string; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "", label: "All" },
];

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  suspended: "neutral",
} as const;

export default function AdminBranchesPage() {
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState<AdminBranchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  // "Add branch" modal
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyBranchDraft);
  const [options, setOptions] = useState<SalonOption[] | null>(null);
  const [cities, setCities] = useState<CityOption[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50", branch: "true" });
    if (status) params.set("status", status);
    const res = await api<AdminBranchRow[]>(`/api/admin/salons?${params}`);
    setRows(res.success && res.data ? res.data : []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openAdd() {
    setDraft(emptyBranchDraft);
    setCreateError(null);
    setAdding(true);
    // Pickers load once, on first open.
    if (!options) {
      const res = await api<SalonOption[]>("/api/admin/salons/options");
      setOptions(res.success && res.data ? res.data : []);
    }
    if (!cities) {
      const res = await api<CityOption[]>("/api/categories/cities");
      setCities(res.success && res.data ? res.data : []);
    }
  }

  function pickSource(sourceId: string) {
    const source = (options ?? []).find((o) => o._id === sourceId);
    setDraft((d) => ({
      ...d,
      sourceId,
      // Prefill from the source salon - branches usually share the brand
      // name; the phone is just a starting point to edit.
      name: source && !d.name ? source.name : d.name,
      phone: source && !d.phone ? source.phone : d.phone,
    }));
  }

  async function createBranch() {
    if (!draft.sourceId) {
      setCreateError("Select which salon this branch belongs to.");
      return;
    }
    if (draft.name.trim().length < 2) {
      setCreateError("Please enter the branch name.");
      return;
    }
    if (!draft.cityId) {
      setCreateError("Select the branch's city.");
      return;
    }
    if (draft.address.trim().length < 5) {
      setCreateError("Please enter the branch's full address.");
      return;
    }
    if (draft.phone.trim().length < 7) {
      setCreateError("Please enter a valid phone number.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    const res = await api(`/api/admin/salons/${draft.sourceId}/branches`, {
      method: "POST",
      json: {
        name: draft.name.trim(),
        cityId: draft.cityId,
        address: draft.address.trim(),
        phone: draft.phone.trim(),
        whatsapp: draft.whatsapp.trim() || undefined,
        email: draft.email.trim() || undefined,
      },
    });
    setCreating(false);
    if (res.success) {
      setAdding(false);
      // The new branch is live immediately - show it where it landed.
      setStatus("approved");
      if (status === "approved") void load();
    } else {
      const fieldErrors = Object.values(res.errors ?? {}).flat().join(" ");
      setCreateError(fieldErrors || res.message || "Could not create the branch.");
    }
  }

  function busyKey(rowId: string, action: string) {
    return `${rowId}-${action}`;
  }

  async function moderate(
    row: AdminBranchRow,
    action: "approve" | "reject" | "suspend" | "feature" | "unfeature"
  ) {
    let reason: string | undefined;
    if (action === "reject") {
      reason = window.prompt("Rejection reason (sent to the owner):") ?? undefined;
      if (reason === undefined) return;
    }
    setBusy(busyKey(row._id, action));
    const res = await api(`/api/salons/${row._id}/moderate`, {
      method: "POST",
      json: { action, reason },
    });
    setBusy(null);
    if (res.success) void load();
  }

  async function hardDelete(row: AdminBranchRow) {
    if (
      !window.confirm(
        `PERMANENTLY delete "${row.name}"?\n\nThis removes the salon, its services, staff, bookings, reviews and subscription. This cannot be undone.\n\nUse Suspend instead if you might want it back.`
      )
    ) {
      return;
    }
    setBusy(busyKey(row._id, "delete"));
    const res = await api(`/api/admin/salons/${row._id}`, { method: "DELETE" });
    setBusy(null);
    if (res.success) void load();
    else window.alert(res.message ?? "Could not delete.");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-fg-muted">
          Additional locations of salons already on GetSalons. Add a branch
          for any salon here - it copies the salon&apos;s profile and full
          service menu and goes live immediately under the same owner.
        </p>
        <Button size="sm" onClick={() => void openAdd()}>
          <Plus className="h-4 w-4" /> Add branch
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              status === t.value
                ? "border-gold-500 bg-gold-500/15 text-gold"
                : "border-line text-fg-muted hover:text-fg"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No branch requests in this state" />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row._id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {row.name}
                    {row.isVerified && <BadgeCheck className="h-4 w-4 text-gold" />}
                    <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                    {row.isFeatured && <Badge variant="gold">Featured</Badge>}
                  </p>
                  <p className="mt-1 text-xs text-fg-muted">
                    {row.cityName} · {row.phone} · Owner: {row.owner?.name ?? "—"}{" "}
                    {row.owner?.email ? `(${row.owner.email})` : ""}
                  </p>
                  {row.siblingSalons.length > 0 && (
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
                      <GitBranch className="h-3.5 w-3.5 shrink-0 text-gold" />
                      Branch of:{" "}
                      {row.siblingSalons.map((sib, i) => (
                        <span key={sib.slug}>
                          {i > 0 && ", "}
                          {sib.status === "approved" ? (
                            <Link
                              href={`/salon/${sib.slug}`}
                              target="_blank"
                              className="font-medium text-gold hover:underline"
                            >
                              {sib.name}
                            </Link>
                          ) : (
                            <span className="font-medium">
                              {sib.name} ({sib.status})
                            </span>
                          )}
                        </span>
                      ))}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-fg-faint">
                    Submitted{" "}
                    {new Date(row.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {row.status === "approved" && (
                  <Link
                    href={`/salon/${row.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs font-medium text-gold hover:underline"
                  >
                    View live <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                {row.status === "pending" && (
                  <>
                    <Button size="sm" loading={busy === busyKey(row._id, "approve")} onClick={() => moderate(row, "approve")}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={busy === busyKey(row._id, "reject")}
                      onClick={() => moderate(row, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {row.status === "approved" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={busy === busyKey(row._id, row.isFeatured ? "unfeature" : "feature")}
                      onClick={() => moderate(row, row.isFeatured ? "unfeature" : "feature")}
                    >
                      <Star className="h-3.5 w-3.5" />
                      {row.isFeatured ? "Remove featured" : "Make featured"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500"
                      loading={busy === busyKey(row._id, "suspend")}
                      onClick={() => moderate(row, "suspend")}
                    >
                      Suspend
                    </Button>
                  </>
                )}
                {(row.status === "rejected" || row.status === "suspended") && (
                  <Button size="sm" loading={busy === busyKey(row._id, "approve")} onClick={() => moderate(row, "approve")}>
                    Re-approve
                  </Button>
                )}
                <Link
                  href={`/admin/salons/${row._id}/manage`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
                >
                  <Settings className="h-3.5 w-3.5" /> Manage
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-red-500"
                  loading={busy === busyKey(row._id, "delete")}
                  onClick={() => hardDelete(row)}
                >
                  Delete permanently
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a branch">
        <div className="space-y-4">
          <div>
            <Label required>Branch of which salon?</Label>
            {options === null ? (
              <p className="text-sm text-fg-muted">Loading salons…</p>
            ) : (
              <Select value={draft.sourceId} onChange={(e) => pickSource(e.target.value)}>
                <option value="">Select a salon…</option>
                {options.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name} — {o.cityName}
                    {o.status !== "approved" ? ` (${o.status})` : ""}
                    {o.ownerName ? ` · ${o.ownerName}` : ""}
                  </option>
                ))}
              </Select>
            )}
            <p className="mt-1 text-xs text-fg-muted">
              The branch is created under this salon&apos;s owner account, and
              all of its services are copied over.
            </p>
          </div>
          <div>
            <Label required>Branch name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Glow Salon — DHA Branch"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label required>City</Label>
              {cities === null ? (
                <p className="text-sm text-fg-muted">Loading cities…</p>
              ) : (
                <Select
                  value={draft.cityId}
                  onChange={(e) => setDraft({ ...draft, cityId: e.target.value })}
                >
                  <option value="">Select city…</option>
                  {cities.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </Select>
              )}
            </div>
            <div>
              <Label required>Phone</Label>
              <Input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="03xx-xxxxxxx"
              />
            </div>
          </div>
          <div>
            <Label required>Address</Label>
            <Input
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              placeholder="Shop, street, area…"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={draft.whatsapp}
                onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
          <p className="text-xs text-fg-muted">
            The branch goes live immediately. You can adjust its details,
            services and photos afterwards from its Manage page.
          </p>

          {createError && <p className="text-sm text-red-500">{createError}</p>}

          <Button className="w-full" loading={creating} onClick={createBranch}>
            Create branch
          </Button>
        </div>
      </Modal>
    </div>
  );
}
