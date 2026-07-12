import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

export interface CompletionStep {
  label: string;
  done: boolean;
  href: string;
  hint: string;
}

/** Step-by-step profile completion card with a progress percentage.
 *  Hidden automatically once every step is done. */
export function ProfileCompletion({ steps }: { steps: CompletionStep[] }) {
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);
  if (pct === 100) return null;

  return (
    <div className="rounded-2xl border border-gold-500/40 bg-gold-500/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">Complete your salon profile</p>
        <span className="font-display text-lg font-bold text-gold">{pct}% complete</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-gold-500 transition-all"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-fg-muted">
        Complete profiles get found more often and win more bookings.
      </p>

      <ul className="mt-4 space-y-1">
        {steps.map((step) =>
          step.done ? (
            <li key={step.label} className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-fg-faint">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
              <span className="line-through">{step.label}</span>
            </li>
          ) : (
            <li key={step.label}>
              <Link
                href={step.href}
                className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-gold-500/10"
              >
                <Circle className="h-4.5 w-4.5 shrink-0 text-fg-faint" />
                <span className="font-medium">{step.label}</span>
                <span className="hidden text-xs text-fg-faint sm:inline">— {step.hint}</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gold opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
