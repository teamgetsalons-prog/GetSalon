import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  Quote,
  Search,
  Star,
  Store,
} from "lucide-react";
import { getHomePageData, type HomePageData } from "@/lib/server-api";
import { SalonCard } from "@/components/salons/salon-card";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { AnimatedHero } from "@/components/home/animated-hero";
import { AnimatedSection } from "@/components/home/animated-section";
import { AnimatedCard } from "@/components/home/animated-card";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo";
import { SITE, SITE_FAQS, TESTIMONIALS } from "@getsalons/shared/constants";
import { CategoryIcon } from "@/components/home/category-icon";
import type { SalonCardData } from "@getsalons/shared/types";

// ISR: revalidate every 60 seconds instead of forcing dynamic on every load
export const revalidate = 60;

async function loadData(): Promise<HomePageData> {
  return (await getHomePageData()) ?? {
    featured: [],
    topRated: [],
    newest: [],
    categories: [],
    cities: [],
    stats: { salons: 0, customers: 0, bookings: 0, cities: 0 },
  };
}

export default async function HomePage() {
  const data = await loadData();

  return (
    <>
      <JsonLd data={faqJsonLd(SITE_FAQS)} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1280&q=75"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsM EBcQERMRCwsMEBgPEhMSFBITExIYFRYYHB4fHhT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AKwA//9k="
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <AnimatedHero cities={data.cities} stats={data.stats} />
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      {data.categories.length > 0 && (
        <AnimatedSection
          title="Browse by category"
          subtitle="Whatever the occasion, we've got a specialist for it."
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {data.categories.map((cat) => (
              <AnimatedCard key={cat._id}>
                <Link
                  href={`/salons?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-card p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/12 text-gold transition-colors group-hover:bg-gold-500 group-hover:text-gold-950">
                    <CategoryIcon name={cat.icon} className="h-5.5 w-5.5" />
                  </span>
                  <span className="text-xs font-medium text-fg sm:text-sm">
                    {cat.name}
                  </span>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* ── Featured salons ──────────────────────────────── */}
      {data.featured.length > 0 && (
        <AnimatedSection
          title="Featured salons"
          subtitle="Hand-picked premium partners loved by customers."
          href="/salons"
        >
          <SalonGrid salons={data.featured} />
        </AnimatedSection>
      )}

      {/* ── Top rated ────────────────────────────────────── */}
      {data.topRated.length > 0 && (
        <AnimatedSection
          title="Top rated near you"
          subtitle="Highest-rated salons based on verified reviews."
          href="/salons?sort=rating"
        >
          <SalonGrid salons={data.topRated} />
        </AnimatedSection>
      )}

      {/* ── How it works ─────────────────────────────────── */}
      <AnimatedSection
        title="How GetSalons works"
        subtitle="From discovery to fresh look in three steps."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "1. Discover",
              text: "Search by city, service or salon name. Filter by price, rating, ladies-only, home service and more.",
            },
            {
              icon: CalendarCheck,
              title: "2. Book instantly",
              text: "Pick your service, favourite specialist and a time slot that suits you. Confirmation lands in your inbox.",
            },
            {
              icon: Star,
              title: "3. Review & repeat",
              text: "Rate your experience with a verified review and help the community find the best salons in Pakistan.",
            },
          ].map((step, i) => (
            <AnimatedCard key={step.title} index={i}>
              <div className="rounded-2xl border border-line bg-card p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/12 text-gold">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-fg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {step.text}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* ── New on GetSalons ──────────────────────────────── */}
      {data.newest.length > 0 && (
        <AnimatedSection
          title="New on GetSalons"
          subtitle="Fresh faces — be among the first to review them."
          href="/salons?sort=newest"
        >
          <SalonGrid salons={data.newest} />
        </AnimatedSection>
      )}

      {/* ── Testimonials ─────────────────────────────────── */}
      <AnimatedSection
        title="Loved across Pakistan"
        subtitle="Real words from real customers."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <AnimatedCard key={t.name} index={i}>
              <figure className="flex flex-col rounded-2xl border border-line bg-card p-6">
                <Quote className="h-6 w-6 text-gold" aria-hidden />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-fg">{t.name}</p>
                    <p className="text-xs text-fg-faint">{t.city}</p>
                  </div>
                  <span className="flex text-gold-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* ── Become a partner ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-950 via-[#241505] to-black px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-500/20 blur-3xl animate-float" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <Store className="mx-auto h-10 w-10 text-gold-400 animate-fade-in" aria-hidden />
          <h2 className="font-display mx-auto mt-4 max-w-xl text-3xl font-bold text-white sm:text-4xl animate-fade-in-up">
            Own a salon? Grow your business with GetSalons.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/60 sm:text-base animate-fade-in-up delay-100">
            Get discovered by thousands of customers, take bookings 24/7,
            manage your team and build your reputation — free to start.
          </p>
          <Link
            href="/partner"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-7 py-3 text-sm font-semibold text-gold-950 transition-all hover:bg-gold-400 hover:scale-105 animate-fade-in-up delay-200 animate-pulse-glow"
          >
            Become a Partner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold animate-fade-in-up">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-center text-sm text-fg-muted animate-fade-in-up delay-100">
          Everything you need to know about booking with GetSalons.
        </p>
        <div className="mt-8 animate-fade-in-up delay-200">
          <FaqAccordion faqs={SITE_FAQS} />
        </div>
      </section>
    </>
  );
}

function SalonGrid({ salons }: { salons: SalonCardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {salons.map((salon, i) => (
        <AnimatedCard key={salon._id} index={i}>
          <SalonCard salon={salon} />
        </AnimatedCard>
      ))}
    </div>
  );
}
