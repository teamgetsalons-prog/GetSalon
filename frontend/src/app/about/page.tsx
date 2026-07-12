import type { Metadata } from "next";
import Link from "next/link";
import { Scissors, Users, Star, MapPin, Shield, Heart } from "lucide-react";
import { SITE } from "@getsalons/shared/constants";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = buildMetadata({
  title: `About Us | ${SITE.shortName}`,
  description: `Learn about ${SITE.name} — Pakistan's #1 salon discovery and booking platform. Our mission is to connect customers with the best beauty professionals across the country.`,
  path: "/about",
});

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    text: "Every review on GetSalons is from a verified booking. No fake ratings, no hidden fees — just honest opinions from real customers.",
  },
  {
    icon: Users,
    title: "Empowering Salons",
    text: "We give salon owners the digital tools they need to grow — from a free online listing to appointment management and analytics.",
  },
  {
    icon: Star,
    title: "Quality First",
    text: "We manually verify every salon before it goes live. Only businesses that meet our standards appear on the platform.",
  },
  {
    icon: Heart,
    title: "Made for Pakistan",
    text: "Built locally with love. We understand the unique needs of Pakistani salons and customers — from pricing to cultural preferences.",
  },
];

const stats = [
  { value: "500+", label: "Partner Salons" },
  { value: "50K+", label: "Happy Customers" },
  { value: "15+", label: "Cities" },
  { value: "100K+", label: "Bookings Completed" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
        ])}
      />

      <nav aria-label="Breadcrumb" className="py-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">About Us</span>
      </nav>

      {/* Hero */}
      <section className="py-10 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Making beauty accessible{" "}
          <span className="text-gold">across Pakistan</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
          {SITE.name} is Pakistan&apos;s first and largest platform for discovering,
          comparing and booking salon services. We connect customers with the
          best beauty professionals — and give salons the tools to grow.
        </p>
      </section>

      {/* Stats */}
      <section className="animate-fade-in-up delay-100">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-line bg-card p-5 text-center"
            >
              <p className="font-display text-2xl font-bold text-gold">{stat.value}</p>
              <p className="mt-1 text-xs text-fg-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mt-14 animate-fade-in-up delay-200">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Our Mission</h2>
        <div className="mt-4 space-y-4 text-fg-muted leading-relaxed">
          <p>
            Finding the right salon shouldn&apos;t be a guessing game. In Pakistan,
            the beauty industry is massive — yet most salons still rely on
            word-of-mouth and walk-ins. Customers have no way to compare prices,
            read real reviews or book appointments without calling.
          </p>
          <p>
            {SITE.name} changes that. We built a platform where every salon has a
            transparent profile with verified reviews, real pricing and instant
            online booking. Customers can discover the best salons in their city,
            compare services and book in seconds — all from their phone.
          </p>
          <p>
            For salon owners, {SITE.name} is a free growth channel. List your
            business, showcase your work, manage bookings and build your
            reputation — without paying commissions on every appointment.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mt-14 animate-fade-in-up delay-300">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">What We Stand For</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-line bg-card p-6"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/12 text-gold">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-fg">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it started */}
      <section className="mt-14 animate-fade-in-up delay-300">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">How It Started</h2>
        <div className="mt-4 space-y-4 text-fg-muted leading-relaxed">
          <p>
            {SITE.name} was born from a simple frustration: spending 30 minutes
            calling around to find a salon that&apos;s open, has availability, and
            doesn&apos;t cost a fortune. We knew there had to be a better way.
          </p>
          <p>
            In 2024, we set out to build the platform we wished existed — a place
            where every Pakistani could find, compare and book beauty services with
            confidence. Today, thousands of customers and hundreds of salons trust
            {SITE.name} every day.
          </p>
          <p>
            We&apos;re just getting started. Our vision is to become the operating
            system for Pakistan&apos;s beauty industry — powering everything from
            discovery to payments to inventory management.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 text-center animate-fade-in-up delay-300">
        <div className="rounded-3xl bg-gradient-to-br from-gold-950 via-[#241505] to-black p-10">
          <Scissors className="mx-auto h-8 w-8 text-gold-400" />
          <h2 className="font-display mt-4 text-2xl font-bold text-white">
            Ready to get discovered?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
            Join hundreds of salons already growing with {SITE.name}. List your
            business for free — it takes less than 2 minutes.
          </p>
          <Link
            href="/partner"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-semibold text-gold-950 transition-all hover:bg-gold-400"
          >
            Become a Partner
          </Link>
        </div>
      </section>
    </div>
  );
}
