"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { EmptyState, Spinner } from "@/components/ui/misc";

interface SupportRow {
  _id: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  reply?: string;
  createdAt: string;
  from?: { name?: string; email?: string; phone?: string; role?: string };
  contactName?: string;
  contactEmail?: string;
  salon?: { name?: string; slug?: string };
}

const tabs = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "", label: "All" },
];

export default function AdminSupportPage() {
  const [status, setStatus] = useState("open");
  const [rows, setRows] = useState<SupportRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setRows(null);
    const res = await api<SupportRow[]>(`/api/admin/support${status ? `?status=${status}` : ""}`);
    setRows(res.success && res.data ? res.data : []);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  function busyKey(rowId: string, action: string) {
    return `${rowId}-${action}`;
  }

  async function reply(row: SupportRow, resolve: boolean) {
    const text = (drafts[row._id] ?? "").trim();
    if (!text && !resolve) return;
    setBusy(busyKey(row._id, resolve ? "resolve" : "reply"));
    const res = await api(`/api/admin/support/${row._id}`, {
      method: "PATCH",
      json: { ...(text ? { reply: text } : {}), ...(resolve ? { status: "resolved" } : {}) },
    });
    setBusy(null);
    if (res.success) {
      setDrafts((d) => ({ ...d, [row._id]: "" }));
      void load();
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
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

      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No messages" hint="Salon owners' messages will appear here." />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row._id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{row.subject}</p>
                <Badge variant={row.status === "resolved" ? "success" : "gold"}>
                  {row.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-fg-muted">
                {row.from?.name ?? row.contactName ?? "Unknown"}
                {row.from ? ` (${row.from.role ?? "user"})` : " (public)"}
                {row.from?.email ? ` · ${row.from.email}` : row.contactEmail ? ` · ${row.contactEmail}` : ""}
                {row.from?.phone ? ` · ${row.from.phone}` : ""}
                {row.salon?.name ? ` · Salon: ${row.salon.name}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-bg-soft p-3.5 text-sm">{row.message}</p>
              <p className="mt-1 text-xs text-fg-faint">
                {new Date(row.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              </p>

              {row.reply && (
                <div className="mt-3 rounded-xl border border-gold-500/30 bg-gold-500/8 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold">Your reply</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{row.reply}</p>
                </div>
              )}

              <div className="mt-3 space-y-2 border-t border-line pt-3">
                <Textarea
                  value={drafts[row._id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [row._id]: e.target.value }))}
                  rows={2}
                  placeholder={row.reply ? "Send an updated reply…" : "Write a reply — the owner sees it in their panel…"}
                  maxLength={3000}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" loading={busy === busyKey(row._id, "reply")} onClick={() => reply(row, false)}>
                    Send reply
                  </Button>
                  {row.status === "open" ? (
                    <Button size="sm" variant="outline" loading={busy === busyKey(row._id, "resolve")} onClick={() => reply(row, true)}>
                      {drafts[row._id]?.trim() ? "Reply & resolve" : "Mark resolved"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={busy === busyKey(row._id, "reopen")}
                      onClick={async () => {
                        setBusy(busyKey(row._id, "reopen"));
                        await api(`/api/admin/support/${row._id}`, { method: "PATCH", json: { status: "open" } });
                        setBusy(null);
                        void load();
                      }}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
