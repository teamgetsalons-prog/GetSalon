import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { SITE } from "@getsalons/shared/constants";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = buildMetadata({
  title: `Contact Us | ${SITE.shortName}`,
  description: `Get in touch with the ${SITE.name} team. Reach us by email, phone or visit our office. We'd love to hear from you — whether you're a customer or a salon owner.`,
  path: "/contact",
});

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@getsalons.pk",
    href: "mailto:hello@getsalons.pk",
    description: "For general enquiries, partnerships and support.",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+92 300 1234567",
    href: "https://wa.me/923001234567",
    description: "Quick responses during business hours.",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Lahore, Pakistan",
    href: null,
    description: "We're based in Lahore and serve salons across Pakistan.",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Fri, 9 AM – 6 PM",
    href: null,
    description: "Pakistan Standard Time (PKT).",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact Us", path: "/contact" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: `Contact ${SITE.name}`,
            url: `${SITE.url}/contact`,
            description: `Get in touch with the ${SITE.name} team for support, partnerships or general enquiries.`,
          },
        ]}
      />

      <nav aria-label="Breadcrumb" className="py-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">Contact Us</span>
      </nav>

      <section className="py-10 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          Get in <span className="text-gold">touch</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fg-muted">
          Have a question, suggestion or partnership idea? We&apos;d love to hear
          from you. Reach out through any of the channels below.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 animate-fade-in-up delay-100">
        {contactMethods.map((method) => (
          <div
            key={method.label}
            className="rounded-2xl border border-line bg-card p-6"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/12 text-gold">
              <method.icon className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-faint">
              {method.label}
            </h3>
            {method.href ? (
              <a
                href={method.href}
                className="mt-2 block text-lg font-semibold text-fg hover:text-gold"
              >
                {method.value}
              </a>
            ) : (
              <p className="mt-2 text-lg font-semibold text-fg">{method.value}</p>
            )}
            <p className="mt-1 text-sm text-fg-muted">{method.description}</p>
          </div>
        ))}
      </div>

      {/* Support for salon owners */}
      <section className="mt-14 animate-fade-in-up delay-200">
        <h2 className="font-display text-2xl font-bold">For Salon Owners</h2>
        <p className="mt-3 text-fg-muted leading-relaxed">
          Already listed on {SITE.name}? Use the in-dashboard support form for
          faster assistance — our team typically responds within a few hours.
        </p>
        <Link
          href="/salon-dashboard/support"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-950 transition-all hover:bg-gold-400"
        >
          Go to Support
        </Link>
      </section>

      {/* FAQ */}
      <section className="mt-14 animate-fade-in-up delay-300">
        <h2 className="font-display text-2xl font-bold">Frequently Asked</h2>
        <div className="mt-4 space-y-4">
          {[
            {
              q: "How do I list my salon on GetSalons?",
              a: 'Click "List Your Salon" in the top navigation and fill out the registration form. Your listing will be reviewed and approved within 24 hours.',
            },
            {
              q: "Is GetSalons free for customers?",
              a: "Yes! Searching, comparing and booking salons is completely free for customers. You only pay for the services at the salon.",
            },
            {
              q: "How do I report an issue with a booking?",
              a: "Contact the salon directly through your booking confirmation or reach out to us at hello@getsalons.pk and we'll help resolve it.",
            },
            {
              q: "Can I change or cancel my booking?",
              a: "Yes, you can reschedule or cancel bookings from your dashboard. Late cancellations may be subject to the salon's cancellation policy.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-line bg-card p-5"
            >
              <h3 className="font-semibold text-fg">{item.q}</h3>
              <p className="mt-2 text-sm text-fg-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
