"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Check, Heart, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";

export function FavoriteButton({
  salonId,
  initialFavorited,
}: {
  salonId: string;
  initialFavorited: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    const prev = favorited;
    setFavorited(!prev);
    const res = await api<{ favorited: boolean }>("/api/favorites", {
      method: "POST",
      json: { salonId },
    });
    if (!res.success) setFavorited(prev);
    else setFavorited(res.data!.favorited);
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favourites" : "Save to favourites"}
      className={cn(
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all",
        favorited
          ? "border-red-500/40 bg-red-500/10 text-red-500"
          : "border-line bg-card text-fg-muted hover:border-red-500/40 hover:text-red-500"
      )}
    >
      <Heart className={cn("h-4.5 w-4.5", favorited && "fill-current")} />
    </button>
  );
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={share}
      aria-label="Share this salon"
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-line bg-card text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
    >
      {copied ? <Check className="h-4.5 w-4.5 text-emerald-500" /> : <Share2 className="h-4.5 w-4.5" />}
    </button>
  );
}
