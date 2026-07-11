import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  Megaphone,
  Star,
  Users,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "List Your Salon — Grow Your Beauty Business",
  description:
    "Join GetSalons Pakistan as a partner salon. Get discovered by thousands of customers, accept online bookings 24/7, manage staff and build your reputation — completely free.",
  path: "/partner",
});

const perks = [
  {
    icon: Users,
    title: "Reach thousands of customers",
    text: "Your salon appears in searches across your city — no marketing budget needed.",
  },
  {
    icon: CalendarCheck,
    title: "24/7 online bookings",
    text: "Customers book while you sleep. Smart scheduling prevents double bookings automatically.",
  },
  {
    icon: Star,
    title: "Build trust with verified reviews",
    text: "Only real customers can review. Reply to feedback and grow your reputation.",
  },
  {
    icon: BarChart3,
    title: "Know your numbers",
    text: "Track bookings, revenue and busiest hours from a beautiful dashboard.",
  },
  {
    icon: Megaphone,
    title: "Stand out in your city",
    text: "A verified badge, gallery showcase and featured homepage placement for top-rated salons.",
  },
];

export default function PartnerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      {/* Hero */}
      <div className="text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          For salon owners
        </p>
        <h1 className="font-display mx-auto max-w-2xl text-4xl font-bold sm:text-5xl">
          Fill your chairs. <span className="text-gold-gradient">Grow your brand.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-fg-muted">
          Join Pakistan&apos;s fastest-growing salon marketplace. Listing is
          completely free, setup takes 10 minutes, and your first booking
          could arrive today.
        </p>
        <Link
          href="/partner/register"
          className="mt-7 inline-block rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold text-gold-950 transition-colors hover:bg-gold-400"
        >
          List your salon — free
        </Link>
      </div>

      {/* Perks */}
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perks.map((perk) => (
          <div key={perk.title} className="rounded-2xl border border-line bg-card p-6">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/12 text-gold">
              <perk.icon className="h-5 w-5" />
            </span>
            <h2 className="font-semibold">{perk.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{perk.text}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-20">
        <h2 className="font-display text-center text-3xl font-bold">
          Live in three simple steps
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Create your business account",
              text: "Sign up with your email and phone number — it takes less than a minute.",
            },
            {
              step: "2",
              title: "Add your salon profile",
              text: "Your services, team, photos, working hours and location. Everything customers need to choose you.",
            },
            {
              step: "3",
              title: "Get approved & take bookings",
              text: "Our team reviews every listing to keep quality high — you're usually live within 48 hours.",
            },
          ].map((s) => (
            <div key={s.step} className="rounded-3xl border border-line bg-card p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 font-display text-lg font-bold text-gold-950">
                {s.step}
              </span>
              <h3 className="mt-4 font-semibold text-fg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 rounded-3xl border border-gold-500/30 bg-gold-500/5 p-10 text-center">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Ready to grow your salon?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
          Create your business account, submit your salon profile, and go live
          after a quick review — usually within 48 hours.
        </p>
        <Link
          href="/partner/register"
          className="mt-6 inline-block rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold text-gold-950 transition-colors hover:bg-gold-400"
        >
          Get started now
        </Link>
      </div>
    </div>
  );
}
