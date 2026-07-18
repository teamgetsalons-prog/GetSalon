import Link from "next/link";
import { Hammer } from "lucide-react";

/** Friendly gate shown in place of a feature that isn't launched yet. */
export function UnderDevelopment({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">
        <Hammer className="h-7 w-7 text-gold" aria-hidden />
      </span>
      <div>
        <p className="font-semibold text-fg">{feature} is coming soon</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">
          This feature is currently under development. We&apos;re polishing it
          and will switch it on for your account as soon as it&apos;s ready.
        </p>
      </div>
      <Link
        href="/salon-dashboard"
        className="rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
      >
        Back to overview
      </Link>
    </div>
  );
}
