"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Search } from "lucide-react";

export function HeroSearch({
  cities,
}: {
  cities: { _id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    router.push(`/salons${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="glass mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl p-2 shadow-2xl shadow-black/20 sm:flex-row"
      role="search"
    >
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-card px-3">
        <Search className="h-4.5 w-4.5 shrink-0 text-fg-faint" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Salon, service or treatment…"
          aria-label="Search salons or services"
          className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
        />
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-card px-3 sm:w-44">
        <MapPin className="h-4.5 w-4.5 shrink-0 text-fg-faint" aria-hidden />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="Select city"
          className="h-12 w-full cursor-pointer appearance-none bg-transparent text-sm text-fg outline-none"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="h-12 cursor-pointer rounded-xl bg-gold-500 px-7 text-sm font-semibold text-gold-950 transition-colors hover:bg-gold-400"
      >
        Search
      </button>
    </form>
  );
}
