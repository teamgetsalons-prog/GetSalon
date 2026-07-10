import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-7xl font-bold text-gold">404</p>
      <h1 className="text-xl font-semibold">This page got a makeover — and moved.</h1>
      <p className="max-w-md text-sm text-fg-muted">
        The page you&apos;re looking for doesn&apos;t exist. Try searching for a
        salon instead.
      </p>
      <Link
        href="/salons"
        className="mt-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
      >
        Browse Salons
      </Link>
    </div>
  );
}
