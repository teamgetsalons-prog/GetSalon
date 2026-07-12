"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

export function AnimatedSection({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle: string;
  href?: string;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInView({ rootMargin: "-100px" });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div
        ref={ref}
        className={`animate-fade-in-up ${inView ? "" : "opacity-0"}`}
      >
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
            <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p>
          </div>
          {href && (
            <Link
              href={href}
              className="shrink-0 items-center gap-1 text-sm font-medium text-gold hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
