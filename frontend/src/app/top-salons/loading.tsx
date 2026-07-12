"use client";

import { SalonGridSkeleton } from "@/components/ui/skeleton";

export default function TopSalonsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <div className="skeleton mx-auto h-8 w-64" />
        <div className="skeleton mx-auto mt-3 h-4 w-80 max-w-full" />
      </div>
      <SalonGridSkeleton count={8} />
    </div>
  );
}
