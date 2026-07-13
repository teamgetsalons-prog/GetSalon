"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export function SalonSearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    const trimmed = query.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");
    router.push(`/salons?${next.toString()}`, { scroll: false });
  }

  function handleClear() {
    setQuery("");
    const next = new URLSearchParams(params.toString());
    next.delete("q");
    next.delete("page");
    router.push(`/salons?${next.toString()}`, { scroll: false });
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search salons by name or service..."
        className="h-12 w-full rounded-xl border border-line bg-card pl-11 pr-10 text-sm text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-fg-faint hover:text-fg-muted"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
