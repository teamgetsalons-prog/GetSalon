"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ExternalLink, Star } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { SalonStatus } from "@getsalons/shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState, Spinner } from "@/components/ui/misc";

interface AdminSalonRow {
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

export default function AdminSalonsPage() {
  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);
  const [rows, setRows] = useState<AdminSalonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    // Additional locations for an existing owner are reviewed separately
    // under Branch Requests - this list is first-time salon submissions only.
    const params = new URLSearchParams({ limit: "50", branch: "false" });
    if (status) params.set("status", status);
    if (debouncedQ) params.set("q", debouncedQ);
    const res = await api<AdminSalonRow[]>(`/api/admin/salons?${params}`);
    setRows(res.success && res.data ? res.data : []);
    setLoading(false);
  }, [status, debouncedQ]);

  useEffect(() => {
    void load();
  }, [load]);

  function busyKey(rowId: string, action: string) {
    return `${rowId}-${action}`;
  }

  async function moderate(
    row: AdminSalonRow,
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

  async function hardDelete(row: AdminSalonRow) {
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
      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, city, phone…"
          className="ml-auto h-9 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No salons in this state" />
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
    </div>
  );
}
