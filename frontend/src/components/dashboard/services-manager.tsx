"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatPKR } from "@getsalons/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";

export interface ServiceRow {
  _id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  discountPrice?: number;
  isActive: boolean;
  isPopular: boolean;
}

const emptyDraft = {
  name: "",
  description: "",
  duration: 45,
  price: 1000,
  discountPrice: 0,
  isPopular: false,
  isActive: true,
};

export function ServicesManager({
  salonId,
  initial,
}: {
  salonId: string;
  initial: ServiceRow[];
}) {
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<ServiceRow | "new" | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await api<ServiceRow[]>(`/api/services?salonId=${salonId}&all=1`);
    if (res.success && res.data) setRows(res.data);
  }

  function openNew() {
    setDraft(emptyDraft);
    setEditing("new");
    setError(null);
  }

  function openEdit(row: ServiceRow) {
    setDraft({
      name: row.name,
      description: row.description ?? "",
      duration: row.duration,
      price: row.price,
      discountPrice: row.discountPrice ?? 0,
      isPopular: row.isPopular,
      isActive: row.isActive,
    });
    setEditing(row);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      ...draft,
      discountPrice: draft.discountPrice || undefined,
    };
    const res =
      editing === "new"
        ? await api("/api/services", { method: "POST", json: payload })
        : await api(`/api/services/${(editing as ServiceRow)._id}`, {
            method: "PATCH",
            json: payload,
          });
    setSaving(false);
    if (res.success) {
      setEditing(null);
      void refresh();
    } else {
      setError(
        res.message ??
          Object.values(res.errors ?? {})
            .flat()
            .join(" ") ??
          "Could not save."
      );
    }
  }

  async function remove(row: ServiceRow) {
    if (!window.confirm(`Remove "${row.name}" from your menu?`)) return;
    const res = await api(`/api/services/${row._id}`, { method: "DELETE" });
    if (res.success) void refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Services ({rows.length})</h2>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" /> Add service
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No services yet"
          hint="Add your service menu so customers can book you online."
          action={<Button onClick={openNew}>Add your first service</Button>}
        />
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {rows.map((row) => (
            <div key={row._id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {row.name}
                  {row.isPopular && <Badge variant="gold">Popular</Badge>}
                  {!row.isActive && <Badge variant="danger">Hidden</Badge>}
                </p>
                <p className="mt-0.5 text-xs text-fg-muted">
                  {row.duration} min ·{" "}
                  {row.discountPrice && row.discountPrice < row.price ? (
                    <>
                      <span className="line-through">{formatPKR(row.price)}</span>{" "}
                      <span className="font-semibold text-gold">
                        {formatPKR(row.discountPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-gold">
                      {formatPKR(row.price)}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => openEdit(row)}
                  aria-label={`Edit ${row.name}`}
                  className="cursor-pointer rounded-lg border border-line p-2 text-fg-muted hover:border-gold-500/50 hover:text-gold"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => remove(row)}
                  aria-label={`Delete ${row.name}`}
                  className="cursor-pointer rounded-lg border border-line p-2 text-fg-muted hover:border-red-500/50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add service" : "Edit service"}
      >
        <div className="space-y-4">
          <div>
            <Label required>Service name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Haircut & Styling"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              maxLength={500}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label required>Duration (min)</Label>
              <Input
                type="number"
                min={10}
                max={480}
                value={draft.duration}
                onChange={(e) =>
                  setDraft({ ...draft, duration: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label required>Price (Rs)</Label>
              <Input
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) =>
                  setDraft({ ...draft, price: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Sale price</Label>
              <Input
                type="number"
                min={0}
                value={draft.discountPrice}
                onChange={(e) =>
                  setDraft({ ...draft, discountPrice: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="flex gap-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.isPopular}
                onChange={(e) => setDraft({ ...draft, isPopular: e.target.checked })}
                className="h-4 w-4 accent-[#d4941f]"
              />
              Popular badge
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                className="h-4 w-4 accent-[#d4941f]"
              />
              Visible to customers
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button className="w-full" loading={saving} onClick={save}>
            {editing === "new" ? "Add service" : "Save changes"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
