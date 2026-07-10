"use client";

import { useState } from "react";
import { CalendarOff, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { StarRating } from "@/components/ui/star-rating";

export interface StaffRow {
  _id: string;
  name: string;
  title?: string;
  bio?: string;
  avatar?: string;
  serviceIds: string[];
  leaves: { date: string; reason?: string }[];
  rating: { average: number; count: number };
  isActive: boolean;
}

interface ServiceOption {
  _id: string;
  name: string;
}

const emptyDraft = { name: "", title: "", bio: "", serviceIds: [] as string[] };

export function StaffManager({
  salonId,
  initial,
  services,
}: {
  salonId: string;
  initial: StaffRow[];
  services: ServiceOption[];
}) {
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<StaffRow | "new" | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [leaveDate, setLeaveDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await api<
      (Omit<StaffRow, "serviceIds"> & { services: { _id: string }[] })[]
    >(`/api/staff?salonId=${salonId}`);
    if (res.success && res.data) {
      setRows(
        res.data.map((m) => ({
          ...m,
          serviceIds: (m.services ?? []).map((s) =>
            typeof s === "string" ? s : s._id
          ),
        }))
      );
    }
  }

  function openNew() {
    setDraft(emptyDraft);
    setEditing("new");
    setError(null);
  }

  function openEdit(row: StaffRow) {
    setDraft({
      name: row.name,
      title: row.title ?? "",
      bio: row.bio ?? "",
      serviceIds: row.serviceIds,
    });
    setEditing(row);
    setError(null);
  }

  function toggleService(id: string) {
    setDraft((d) => ({
      ...d,
      serviceIds: d.serviceIds.includes(id)
        ? d.serviceIds.filter((s) => s !== id)
        : [...d.serviceIds, id],
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const res =
      editing === "new"
        ? await api("/api/staff", { method: "POST", json: draft })
        : await api(`/api/staff/${(editing as StaffRow)._id}`, {
            method: "PATCH",
            json: draft,
          });
    setSaving(false);
    if (res.success) {
      setEditing(null);
      void refresh();
    } else {
      setError(res.message ?? "Could not save.");
    }
  }

  async function addLeave() {
    if (editing === "new" || !editing || !leaveDate) return;
    const res = await api(`/api/staff/${editing._id}`, {
      method: "PATCH",
      json: { addLeave: { date: leaveDate } },
    });
    if (res.success) {
      setLeaveDate("");
      setEditing(null);
      void refresh();
    }
  }

  async function remove(row: StaffRow) {
    if (!window.confirm(`Remove ${row.name} from your team?`)) return;
    const res = await api(`/api/staff/${row._id}`, { method: "DELETE" });
    if (res.success) void refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Team ({rows.length})</h2>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" /> Add member
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No team members yet"
          hint="Add your specialists so customers can pick who they book with."
          action={<Button onClick={openNew}>Add your first member</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row._id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={row.avatar} name={row.name} size={44} />
                  <div>
                    <p className="text-sm font-semibold">{row.name}</p>
                    {row.title && (
                      <p className="text-xs text-fg-faint">{row.title}</p>
                    )}
                    {row.rating.count > 0 && (
                      <StarRating value={row.rating.average} size={11} count={row.rating.count} />
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(row)}
                    aria-label={`Edit ${row.name}`}
                    className="cursor-pointer rounded-lg border border-line p-2 text-fg-muted hover:border-gold-500/50 hover:text-gold"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(row)}
                    aria-label={`Remove ${row.name}`}
                    className="cursor-pointer rounded-lg border border-line p-2 text-fg-muted hover:border-red-500/50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-fg-muted">
                {row.serviceIds.length === 0
                  ? "Performs all services"
                  : `${row.serviceIds.length} assigned service${row.serviceIds.length > 1 ? "s" : ""}`}
              </p>
              {row.leaves.length > 0 && (
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                  <CalendarOff className="h-3 w-3" />
                  {row.leaves.length} upcoming leave day{row.leaves.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add team member" : "Edit team member"}
        wide
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Sana Malik"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Senior Stylist"
              />
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              rows={2}
              maxLength={500}
            />
          </div>

          <div>
            <Label>Assigned services (none = all)</Label>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => toggleService(s._id)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    draft.serviceIds.includes(s._id)
                      ? "border-gold-500 bg-gold-500/15 text-gold"
                      : "border-line text-fg-muted hover:border-gold-500/40"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {editing !== "new" && editing && (
            <div className="rounded-xl border border-line p-4">
              <Label>Mark a leave day</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                />
                <Button variant="outline" onClick={addLeave} disabled={!leaveDate}>
                  Add leave
                </Button>
              </div>
              {editing.leaves.length > 0 && (
                <p className="mt-2 text-xs text-fg-muted">
                  Upcoming: {editing.leaves.map((l) => l.date).join(", ")}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button className="w-full" loading={saving} onClick={save}>
            {editing === "new" ? "Add member" : "Save changes"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
