"use client";

import { Star } from "lucide-react";
import { cn } from "@getsalons/shared/utils";

/** Display-only star row (server-safe markup, client for interactivity) */
export function StarRating({
  value,
  size = 14,
  showValue = false,
  count,
  className,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex" aria-label={`Rated ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            width={size}
            height={size}
            className={
              star <= Math.round(value)
                ? "fill-gold-400 text-gold-400"
                : "fill-transparent text-fg-faint"
            }
          />
        ))}
      </span>
      {showValue && (
        <span className="text-sm font-semibold text-fg">{value.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-xs text-fg-faint">({count})</span>
      )}
    </span>
  );
}

/** Interactive star picker for review forms */
export function StarPicker({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          <Star
            width={size}
            height={size}
            className={
              star <= value
                ? "fill-gold-400 text-gold-400"
                : "fill-transparent text-fg-faint hover:text-gold-400"
            }
          />
        </button>
      ))}
    </div>
  );
}
