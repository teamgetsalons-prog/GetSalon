"use client";

import { SalonGridSkeleton } from "@/components/ui/skeleton";

export default function SalonsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton mt-2 h-4 w-48" />
      </div>
      <div className="mb-6 flex gap-3">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="skeleton h-10 w-36 rounded-xl" />
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>
      <SalonGridSkeleton count={8} />
    </div>
  );
}
