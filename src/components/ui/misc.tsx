import { Loader2, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <Loader2 className="h-7 w-7 animate-spin text-gold" aria-label="Loading" />
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line py-16 text-center">
      <SearchX className="h-9 w-9 text-fg-faint" aria-hidden />
      <p className="font-medium text-fg">{title}</p>
      {hint && <p className="max-w-sm text-sm text-fg-muted">{hint}</p>}
      {action}
    </div>
  );
}

export function Avatar({
  src,
  name,
  size = 40,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-full bg-gold-500/20 font-semibold text-gold"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
