import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  Check,
  Megaphone,
  Star,
  Users,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
// TODO: Replace server import with API call
import { formatPKR } from "@getsalons/shared/utils";

export const metadata: Metadata = buildMetadata({
  title: "List Your Salon — Grow Your Beauty Business",
  description:
    "Join GetSalons Pakistan as a partner salon. Get discovered by thousands of customers, accept online bookings 24/7, manage staff and build your reputation. Free to start.",
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
    title: "Premium visibility",
    text: "Upgrade for featured placement, priority search ranking and a verified badge.",
  },
];

const planOrder = ["free", "premium", "business"] as const;
const planLabels = {
  free: { name: "Starter", note: "Forever free" },
  premium: { name: "Premium", note: "per month" },
  business: { name: "Business", note: "per month" },
};

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
          free, setup takes 10 minutes, and your first booking could arrive today.
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

      {/* Plans */}
      <div id="plans" className="mt-20">
        <h2 className="font-display text-center text-3xl font-bold">
          Simple, honest pricing
        </h2>
        <p className="mt-2 text-center text-sm text-fg-muted">
          Start free. Upgrade when you&apos;re ready to grow faster.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {planOrder.map((plan) => {
            const features = PLAN_FEATURES[plan];
            const isPopular = plan === "premium";
            return (
              <div
                key={plan}
                className={`relative rounded-3xl border p-7 ${
                  isPopular
                    ? "border-gold-500 bg-card shadow-xl shadow-gold-500/10"
                    : "border-line bg-card"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold text-gold-950">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="font-semibold text-fg">{planLabels[plan].name}</h3>
                <p className="mt-2">
                  <span className="font-display text-3xl font-bold text-gold">
                    {features.price === 0 ? "Free" : formatPKR(features.price)}
                  </span>
                  <span className="ml-1 text-xs text-fg-faint">
                    {planLabels[plan].note}
                  </span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-fg-muted">
                  <PlanItem>Up to {features.maxServices} services</PlanItem>
                  <PlanItem>Up to {features.maxStaff} staff members</PlanItem>
                  <PlanItem>{features.maxGalleryImages} gallery photos</PlanItem>
                  {features.featuredListing && <PlanItem>Featured listing</PlanItem>}
                  {features.prioritySearch && <PlanItem>Priority search ranking</PlanItem>}
                  {features.analytics && <PlanItem>Advanced analytics</PlanItem>}
                  {features.whatsappIntegration && (
                    <PlanItem>WhatsApp notifications</PlanItem>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-fg-faint">
          Online payments (EasyPaisa, JazzCash, cards) are coming soon — for
          now all plans are activated by our team.
        </p>
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

function PlanItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
      {children}
    </li>
  );
}
