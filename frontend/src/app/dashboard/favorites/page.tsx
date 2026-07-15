"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { SalonCardData } from "@getsalons/shared/types";
import { SalonCard } from "@/components/salons/salon-card";
import { EmptyState, Spinner } from "@/components/ui/misc";

export default function FavoritesPage() {
  const [salons, setSalons] = useState<SalonCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await api<SalonCardData[]>("/api/favorites");
      setSalons(res.success && res.data ? res.data : []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Saved salons</h2>
      {loading ? (
        <Spinner />
      ) : salons.length === 0 ? (
        <EmptyState
          title="No favourites yet"
          hint="Tap the heart on any salon to save it here for quick booking."
          action={
            <Link
              href="/salons"
              className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-gold-950 hover:bg-gold-400"
            >
              Discover salons
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {salons.map((salon) => (
            <SalonCard key={salon._id} salon={salon} />
          ))}
        </div>
      )}
    </div>
  );
}
