"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const selectedLabel = city
    ? cities.find((c) => c.slug === city)?.name ?? city
    : "All cities";

  const positionMenu = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (open) positionMenu();
  }, [open, positionMenu]);

  useEffect(() => {
    if (!open) return;
    function handleScroll() {
      positionMenu();
    }
    function handleClick(e: MouseEvent) {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("mousedown", handleClick);
    };
  }, [open, positionMenu]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    router.push(`/salons${params.size ? `?${params}` : ""}`);
  }

  const dropdown = open
    ? createPortal(
        <div style={menuStyle} className="rounded-xl border border-line bg-white shadow-xl dark:bg-[#1a1714]">
          <button
            type="button"
            onClick={() => { setCity(""); setOpen(false); }}
            className={cn(
              "w-full px-3 py-2.5 text-left text-sm",
              !city
                ? "bg-gold-500/15 font-medium text-gold"
                : "text-[#1a1715] hover:bg-gold-500/10 dark:text-[#f5f3f0]"
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
                "w-full px-3 py-2.5 text-left text-sm",
                city === c.slug
                  ? "bg-gold-500/15 font-medium text-gold"
                  : "text-[#1a1715] hover:bg-gold-500/10 dark:text-[#f5f3f0]"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <form
      onSubmit={submit}
      className="glass mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl p-2 shadow-2xl shadow-black/20 sm:flex-row"
      role="search"
    >
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 dark:bg-[#1a1714]">
        <Search className="h-4.5 w-4.5 shrink-0 text-fg-faint" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Salon, service or treatment…"
          aria-label="Search salons or services"
          className="h-12 w-full bg-transparent text-sm text-[#1a1715] outline-none placeholder:text-fg-faint dark:text-[#f5f3f0]"
        />
      </div>

      <div ref={triggerRef} className="relative flex items-center gap-2 rounded-xl bg-white px-3 sm:w-44 dark:bg-[#1a1714]">
        <MapPin className="h-4.5 w-4.5 shrink-0 text-fg-faint" aria-hidden />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-full items-center justify-between gap-1 bg-transparent text-sm text-[#1a1715] outline-none dark:text-[#f5f3f0]"
          aria-label="Select city"
          aria-expanded={open}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-fg-faint transition-transform", open && "rotate-180")} />
        </button>
      </div>

      <button
        type="submit"
        className="h-12 cursor-pointer rounded-xl bg-gold-500 px-7 text-sm font-semibold text-gold-950 transition-colors hover:bg-gold-400"
      >
        Search
      </button>

      {dropdown}
    </form>
  );
}
