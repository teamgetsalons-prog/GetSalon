"use client";

import { BlogListSkeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <div className="skeleton mx-auto h-8 w-48 rounded-full" />
        <div className="skeleton mx-auto mt-4 h-4 w-72 max-w-full" />
      </div>
      <BlogListSkeleton />
    </div>
  );
}
