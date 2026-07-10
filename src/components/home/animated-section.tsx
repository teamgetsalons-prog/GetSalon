"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AnimatedSection({
  title,
  subtitle,
  href,
  children,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  href?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      >
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
            <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p>
          </div>
          {href && (
            <Link
              href={href}
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-gold hover:underline sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </motion.div>
    </section>
  );
}
