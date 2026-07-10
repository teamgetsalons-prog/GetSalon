"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SITE } from "@/lib/constants";
import { HeroSearch } from "./hero-search";

export function AnimatedHero({
  cities,
  stats,
}: {
  cities: { _id: string; name: string; slug: string }[];
  stats: { salons: number; customers: number; bookings: number; cities: number };
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-black/30 px-4 py-1.5 text-xs font-medium text-gold-200">
          <Sparkles className="h-3.5 w-3.5 text-gold-400" />
          {SITE.tagline}
        </p>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="font-display mx-auto max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
      >
        Look your best.{" "}
        <span className="text-gold-gradient">Book in seconds.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="mx-auto mt-5 max-w-xl text-base text-white/70 sm:text-lg"
      >
        Discover top-rated salons, barbers and spas near you. Compare
        prices, read verified reviews and book appointments online — free.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="mt-9"
      >
        <HeroSearch cities={cities} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <Stat value={stats.salons} label="Partner Salons" suffix="+" />
        <Stat value={stats.customers} label="Happy Customers" suffix="+" />
        <Stat value={stats.bookings} label="Appointments" suffix="+" />
        <Stat value={stats.cities} label="Cities" />
      </motion.div>
    </div>
  );
}

function Stat({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-black/40 px-3 py-4 backdrop-blur-sm">
      <p className="font-display text-2xl font-bold text-gold-300">
        {value.toLocaleString("en-PK")}
        {suffix}
      </p>
      <p className="mt-1 text-xs text-white/80">{label}</p>
    </div>
  );
}
