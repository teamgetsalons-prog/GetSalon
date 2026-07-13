"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { MapPin, Search, ChevronDown } from "lucide-react";
import { cn } from "@getsalons/shared/utils";

export function HeroSearch({
  cities,
}: {
  cities: { _id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = city
    ? cities.find((c) => c.slug === city)?.name ?? city
    : "All cities";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

      <div ref={ref} className="relative flex items-center gap-2 rounded-xl bg-card px-3 sm:w-44">
        <MapPin className="h-4.5 w-4.5 shrink-0 text-fg-faint" aria-hidden />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-full items-center justify-between gap-1 bg-transparent text-sm text-fg outline-none"
          aria-label="Select city"
          aria-expanded={open}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-fg-faint transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-card shadow-xl">
            <button
              type="button"
              onClick={() => { setCity(""); setOpen(false); }}
              className={cn(
                "w-full px-3 py-2.5 text-left text-sm hover:bg-gold-500/10",
                !city ? "bg-gold-500/10 font-medium text-gold" : "text-fg"
              )}
            >
              All cities
            </button>
            {cities.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => { setCity(c.slug); setOpen(false); }}
                className={cn(
                  "w-full px-3 py-2.5 text-left text-sm hover:bg-gold-500/10",
                  city === c.slug ? "bg-gold-500/10 font-medium text-gold" : "text-fg"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
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
