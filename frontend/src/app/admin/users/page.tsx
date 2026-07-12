"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { UserRole } from "@getsalons/shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, EmptyState, Spinner } from "@/components/ui/misc";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  city?: string;
  createdAt: string;
}

const roleTabs = [
  { value: "", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "owner", label: "Owners" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admins" },
];

export default function AdminUsersPage() {
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (role) params.set("role", role);
    if (debouncedQ) params.set("q", debouncedQ);
    const res = await api<UserRow[]>(`/api/admin/users?${params}`);
    setRows(res.success && res.data ? res.data : []);
    setLoading(false);
  }, [role, debouncedQ]);

  useEffect(() => {
    void load();
  }, [load]);

  function busyKey(rowId: string, action: string) {
    return `${rowId}-${action}`;
  }

  async function toggleActive(row: UserRow) {
    if (
      row.isActive &&
      !window.confirm(`Deactivate ${row.name}? They won't be able to log in.`)
    ) {
      return;
    }
    setBusy(busyKey(row._id, "toggle"));
    const res = await api("/api/admin/users", {
      method: "PATCH",
      json: { userId: row._id, isActive: !row.isActive },
    });
    setBusy(null);
    if (res.success) void load();
  }

  async function changeRole(row: UserRow, newRole: string) {
    if (newRole === row.role) return;
    if (!window.confirm(`Change ${row.name}'s role from ${row.role} to ${newRole}?`)) return;
    setBusy(busyKey(row._id, "role"));
    const res = await api("/api/admin/users", {
      method: "PATCH",
      json: { userId: row._id, role: newRole },
    });
    setBusy(null);
    if (res.success) void load();
    else window.alert(res.message ?? "Could not change role.");
  }

  async function deleteUser(row: UserRow) {
    if (!window.confirm(`PERMANENTLY delete "${row.name}" (${row.email})?\n\nThis removes the user, their salon, services, staff, bookings and reviews. This cannot be undone.`)) return;
    setBusy(busyKey(row._id, "delete"));
    const res = await api(`/api/admin/users/${row._id}`, { method: "DELETE" });
    setBusy(null);
    if (res.success) void load();
    else window.alert(res.message ?? "Could not delete user.");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {roleTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setRole(t.value)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              role === t.value
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
          placeholder="Search name, email, phone…"
          className="ml-auto h-9 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {rows.map((row) => (
            <div key={row._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={row.name} size={38} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {row.name}
                    <Badge variant={row.role === "admin" ? "gold" : "neutral"}>
                      {row.role}
                    </Badge>
                    {!row.isActive && <Badge variant="danger">Deactivated</Badge>}
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    {row.email}
                    {row.phone ? ` · ${row.phone}` : ""}
                    {row.city ? ` · ${row.city}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={row.role}
                  onChange={(e) => changeRole(row, e.target.value)}
                  disabled={busy === busyKey(row._id, "role")}
                  aria-label={`Role for ${row.name}`}
                  className="h-8 cursor-pointer rounded-lg border border-line bg-card px-2 text-xs text-fg outline-none focus:border-gold-500 [color-scheme:light] dark:[color-scheme:dark]"
                >
                  <option value="customer">customer</option>
                  <option value="owner">owner</option>
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </select>
                <Button
                  size="sm"
                  variant={row.isActive ? "ghost" : "primary"}
                  className={row.isActive ? "text-red-500" : undefined}
                  loading={busy === busyKey(row._id, "toggle")}
                  onClick={() => toggleActive(row)}
                >
                  {row.isActive ? "Deactivate" : "Reactivate"}
                </Button>
                {row.role !== "admin" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    loading={busy === busyKey(row._id, "delete")}
                    onClick={() => deleteUser(row)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
