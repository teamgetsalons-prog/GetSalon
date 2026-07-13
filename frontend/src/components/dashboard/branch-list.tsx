"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Store } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OwnedSalonSummary } from "@/lib/server-api";

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  suspended: "neutral",
} as const;

export function BranchList({
  branches,
  activeSalonId,
}: {
  branches: OwnedSalonSummary[];
  activeSalonId?: string;
}) {
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);

  async function switchTo(id: string) {
    setSwitching(id);
    const res = await api(`/api/salons/${id}/switch`, { method: "POST" });
    setSwitching(null);
    if (res.success) {
      // The active branch changed server-side (new JWT) - a full reload
      // guarantees every dashboard page re-fetches against it.
      window.location.href = "/salon-dashboard";
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Branches</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Manage every location under your account. New branches need
            admin approval before they go live.
          </p>
        </div>
        <Link href="/salon-dashboard/branches/new">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add branch
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {branches.map((b) => {
          const isActive = b.id === activeSalonId;
          return (
            <div
              key={b.id}
              className={cn(
                "flex flex-wrap items-center gap-4 rounded-2xl border p-4 sm:p-5",
                isActive ? "border-gold-500 bg-gold-500/5" : "border-line bg-card"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-fg">{b.name}</p>
                  <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                  {isActive && <Badge variant="gold">Currently managing</Badge>}
                  {b.isFeatured && <Badge variant="gold">Featured</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-fg-muted">
                  {b.address}, {b.areaName ? `${b.areaName}, ` : ""}
                  {b.cityName}
                </p>
              </div>
              {!isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  loading={switching === b.id}
                  onClick={() => void switchTo(b.id)}
                >
                  Manage this branch
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
