import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { SalonCardData } from "@getsalons/shared/types";
import type { DealPublic } from "@/lib/server-api";
import { SITE } from "@getsalons/shared/constants";
import { formatPKR } from "@getsalons/shared/utils";
import { SalonCard } from "@/components/salons/salon-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, offerJsonLd } from "@/lib/seo";

export interface IntentLandingPageProps {
  path: string;
  title: string;
  description: string;
  badge: string;
  breadcrumbs: { name: string; path: string }[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  features: { icon: LucideIcon; title: string; text: string }[];
  sections: { heading: string; paragraphs: ReactNode[] }[];
  faqs: { question: string; answer: string }[];
  relatedLinks: { label: string; href: string; description: string }[];
  linkCards?: {
    heading: string;
    title: string;
    text: string;
    href: string;
  }[];
  salons?: SalonCardData[];
  salonsHeading?: string;
  salonsDescription?: string;
  offers?: DealPublic[];
  offersHeading?: string;
  offersDescription?: string;
  priceRows?: {
    serviceName: string;
    salonName: string;
    cityName: string;
    price: number;
    priceMax?: number;
    href: string;
  }[];
  priceRowsHeading?: string;
  priceRowsDescription?: string;
}

/**
 * Shared shell for search-intent pages. The content is kept route-specific,
 * while the technical SEO and conversion structure stays consistent.
 */
export function IntentLandingPage({
  path,
  title,
  description,
  badge,
  breadcrumbs,
  primaryCta,
  secondaryCta,
  features,
  sections,
  faqs,
  relatedLinks,
  linkCards,
  salons,
  salonsHeading = "Popular salons to explore",
  salonsDescription = "Compare profiles, prices and verified reviews before choosing where to book.",
  offers,
  offersHeading = "Live salon offers",
  offersDescription = "Check the deal price, salon details and package terms before booking.",
  priceRows,
  priceRowsHeading = "Live salon price list examples",
  priceRowsDescription = "These prices come from current salon service menus. Confirm the final amount with the salon when a treatment depends on length, products or consultation.",
}: IntentLandingPageProps) {
  const liveOffers = (offers ?? []).filter((offer) => offer.salon);
  const schema = [
    breadcrumbJsonLd(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: `${SITE.url}${path}`,
      isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    },
    ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
    ...(salons && salons.length > 0
      ? [
          itemListJsonLd(
            salons.slice(0, 20).map((salon) => ({
              name: salon.name,
              url: `${SITE.url}/salon/${salon.slug}`,
              description: `${salon.name} in ${salon.areaName ? `${salon.areaName}, ` : ""}${salon.cityName}.`,
            }))
          ),
        ]
      : []),
    ...(liveOffers.length > 0
      ? [
          offerJsonLd(
            liveOffers.slice(0, 20).map((offer) => ({
              name: offer.title,
              description: offer.description,
              price: offer.dealPrice,
              originalPrice: offer.originalPrice,
              url: `${SITE.url}/salon/${offer.salon!.slug}?deal=${offer._id}`,
              image: offer.image ?? offer.salon!.coverImage ?? undefined,
              validThrough: offer.endDate,
            }))
          ),
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <JsonLd data={schema} />

      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-fg-faint">
        {breadcrumbs.map((item, index) => (
          <span key={item.path}>
            {index > 0 && <span className="mx-1.5">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-fg-muted">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-gold">
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <section className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-gold-950 via-[#241505] to-black px-6 py-12 text-white sm:px-10 lg:px-16 lg:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{badge}</p>
          <h1 className="font-display mt-4 text-3xl font-bold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-gold-950 transition-colors hover:bg-gold-400"
            >
              {primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400/60 hover:text-gold-300"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Page benefits">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-line bg-card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/12 text-gold">
              <feature.icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-semibold text-fg">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{feature.text}</p>
          </div>
        ))}
      </section>

      {salons && salons.length > 0 && (
        <section className="mt-14" aria-labelledby="salon-results-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="salon-results-heading" className="font-display text-2xl font-bold sm:text-3xl">
                {salonsHeading}
              </h2>
              <p className="mt-1 text-sm text-fg-muted">{salonsDescription}</p>
            </div>
            <Link href="/salons" className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
              View all salons <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {salons.slice(0, 8).map((salon) => (
              <SalonCard key={salon._id} salon={salon} />
            ))}
          </div>
        </section>
      )}

      {liveOffers.length > 0 && (
        <section className="mt-14" aria-labelledby="offer-results-heading">
          <div className="mb-6">
            <h2 id="offer-results-heading" className="font-display text-2xl font-bold sm:text-3xl">
              {offersHeading}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">{offersDescription}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {liveOffers.slice(0, 8).map((offer) => (
              <Link
                key={offer._id}
                href={`/salon/${offer.salon!.slug}?deal=${offer._id}`}
                className="group rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-fg group-hover:text-gold">{offer.title}</h3>
                  <span className="shrink-0 rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
                    {offer.discountPercent}% OFF
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted line-clamp-2">{offer.description}</p>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <span className="text-lg font-bold text-gold">{formatPKR(offer.dealPrice)}</span>
                  <span className="text-xs text-fg-faint line-through">{formatPKR(offer.originalPrice)}</span>
                </div>
                <p className="mt-3 border-t border-line pt-3 text-xs text-fg-faint">
                  {offer.salon!.name} · {offer.salon!.cityName}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {priceRows && priceRows.length > 0 && (
        <section className="mt-14" aria-labelledby="price-rows-heading">
          <div className="mb-6">
            <h2 id="price-rows-heading" className="font-display text-2xl font-bold sm:text-3xl">
              {priceRowsHeading}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">{priceRowsDescription}</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-bg-soft text-xs uppercase tracking-wide text-fg-faint">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Salon</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 text-right font-semibold">Starting price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {priceRows.slice(0, 20).map((row) => (
                  <tr key={`${row.href}-${row.serviceName}`} className="hover:bg-bg-soft/60">
                    <td className="px-4 py-3 font-medium text-fg">{row.serviceName}</td>
                    <td className="px-4 py-3">
                      <Link href={row.href} className="text-gold hover:underline">{row.salonName}</Link>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">{row.cityName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gold">
                      {formatPKR(row.price)}{row.priceMax && row.priceMax > row.price ? ` - ${formatPKR(row.priceMax)}` : "+"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="mx-auto mt-14 max-w-4xl">
        {sections.map((section) => (
          <section key={section.heading} className="border-b border-line py-8 first:pt-0 last:border-b-0">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-fg-muted sm:text-base">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {linkCards && linkCards.length > 0 && (
        <section className="mt-8" aria-labelledby="browse-links-heading">
          <h2 id="browse-links-heading" className="font-display text-2xl font-bold sm:text-3xl">
            {linkCards[0].heading}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {linkCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/10"
              >
                <h3 className="font-semibold text-fg group-hover:text-gold">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{card.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gold">
                  Explore <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-2xl font-bold sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-5 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-line bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-fg [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="text-gold transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="border-t border-line px-5 pb-5 pt-4 text-sm leading-relaxed text-fg-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-3xl border border-gold-500/25 bg-gold-500/5 p-6 sm:p-8" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-display text-2xl font-bold">Keep exploring GetSalons</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-3 rounded-2xl border border-line bg-card p-4 transition-colors hover:border-gold-500/40"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>
                <span className="block text-sm font-semibold text-fg group-hover:text-gold">{link.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-fg-muted">{link.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
