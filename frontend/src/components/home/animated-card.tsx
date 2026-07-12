"use client";

import { useInView } from "@/hooks/use-in-view";

export function AnimatedCard({
  children,
  index = 0,
}: {
  children: React.ReactNode;
  index?: number;
}) {
  const { ref, inView } = useInView({ rootMargin: "-50px" });

  return (
    <div
      ref={ref}
      className={`animate-fade-in-up ${inView ? "" : "opacity-0"}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {children}
    </div>
  );
}
