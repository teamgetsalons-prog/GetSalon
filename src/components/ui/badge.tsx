import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "gold"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

const variants: Record<Variant, string> = {
  gold: "bg-gold-500/15 text-gold border border-gold-500/25",
  outline: "border border-line text-fg-muted",
  success:
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
  warning:
    "bg-amber-500/12 text-amber-600 dark:text-amber-400 border border-amber-500/25",
  danger: "bg-red-500/12 text-red-600 dark:text-red-400 border border-red-500/25",
  neutral: "bg-bg-soft text-fg-muted border border-line",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

import type { BookingStatus } from "@/types";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";

const statusVariant: Record<BookingStatus, Variant> = {
  pending: "warning",
  confirmed: "gold",
  completed: "success",
  cancelled: "danger",
  no_show: "neutral",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}
