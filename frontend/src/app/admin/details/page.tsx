"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ExternalLink, Star, Store } from "lucide-react";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import type { SalonStatus } from "@getsalons/shared/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState, Spinner } from "@/components/ui/misc";

interface DirectorySalon {
  _id: string;
  name: string;
  slug: string;
  status: SalonStatus;
  cityName: string;
  phone: string;
  isVerified: boolean;
  isFeatured: boolean;
  rating: { average: number; count: number };
  createdAt: string;
}

interface DirectoryRow {
  owner: { _id: string; name: string; email: string; phone?: string };
  salons: DirectorySalon[];
  salonCount: number;
}

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  suspended: "neutral",
} as const;

export default function AdminDetailsPage() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (debouncedQ) params.set("q", debouncedQ);
    const res = await api<DirectoryRow[]>(`/api/admin/salons/directory?${params}`);
    setRows(res.success && res.data ? res.data : []);
    setLoading(false);
  }, [debouncedQ]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-2xl text-sm text-fg-muted">
          Every salon owner with their full roster of locations in one place
          - primary salon and every branch, whatever their status.
        </p>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search owner, salon, city, phone…"
          className="h-9 w-full sm:w-72"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No matching owners" />
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.owner._id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <div>
                  <p className="text-sm font-semibold text-fg">{row.owner.name}</p>
                  <p className="text-xs text-fg-muted">
                    {row.owner.email} {row.owner.phone ? `· ${row.owner.phone}` : ""}
                  </p>
                </div>
                <Badge variant="gold">
                  {row.salonCount} salon{row.salonCount === 1 ? "" : "s"}
                </Badge>
              </div>

              <div className="mt-3 space-y-2.5">
                {row.salons.map((salon, i) => (
                  <div
                    key={salon._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg-soft p-3"
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Store className="h-3.5 w-3.5 shrink-0 text-fg-faint" />
                        {salon.name}
                        {salon.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-gold" />}
                        <Badge variant={i === 0 ? "outline" : "neutral"}>
                          {i === 0 ? "Primary" : `Branch ${i}`}
                        </Badge>
                        <Badge variant={statusVariant[salon.status]}>{salon.status}</Badge>
                        {salon.isFeatured && <Badge variant="gold">Featured</Badge>}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
                        {salon.cityName} · {salon.phone}
                        {salon.rating.count > 0 && (
                          <span className="flex items-center gap-0.5">
                            · <Star className="h-3 w-3 fill-gold text-gold" /> {salon.rating.average.toFixed(1)} (
                            {salon.rating.count})
                          </span>
                        )}
                        {" · "}
                        Added{" "}
                        {new Date(salon.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {salon.status === "approved" && (
                      <Link
                        href={`/salon/${salon.slug}`}
                        target="_blank"
                        className="flex shrink-0 items-center gap-1 text-xs font-medium text-gold hover:underline"
                      >
                        View live <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
