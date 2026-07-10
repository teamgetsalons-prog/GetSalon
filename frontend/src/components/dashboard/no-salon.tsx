import Link from "next/link";
import { Store } from "lucide-react";

export function NoSalonYet() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line py-20 text-center">
      <Store className="h-10 w-10 text-gold" />
      <div>
        <p className="font-semibold">You haven&apos;t created your salon profile yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">
          Set up your salon in 10 minutes and start receiving online bookings.
        </p>
      </div>
      <Link
        href="/partner/register"
        className="rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
      >
        Create salon profile
      </Link>
    </div>
  );
}
