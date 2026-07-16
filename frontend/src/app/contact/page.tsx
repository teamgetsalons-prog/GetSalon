import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { SITE } from "@getsalons/shared/constants";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = buildMetadata({
  title: `Contact Us | ${SITE.shortName}`,
  description: `Get in touch with the ${SITE.name} team. Reach us by email, phone or send us a message. We'd love to hear from you — whether you're a customer or a salon owner.`,
  path: "/contact",
});

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "team.getsalons@gmail.com",
    href: "mailto:team.getsalons@gmail.com",
    description: "For general enquiries, partnerships and support.",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+92 309 8899061",
    href: "https://wa.me/923098899061",
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
          Have a question, suggestion or partnership idea? Fill out the form below
          or reach out through any of the channels.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] animate-fade-in-up delay-100">
        {/* Contact methods */}
        <div className="space-y-4">
          {contactMethods.map((method) => (
            <div
              key={method.label}
              className="flex items-start gap-4 rounded-2xl border border-line bg-card p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/12 text-gold">
                <method.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-faint">
                  {method.label}
                </h3>
                {method.href ? (
                  <a
                    href={method.href}
                    className="mt-0.5 block text-sm font-semibold text-fg hover:text-gold"
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="mt-0.5 text-sm font-semibold text-fg">{method.value}</p>
                )}
                <p className="mt-0.5 text-xs text-fg-muted">{method.description}</p>
              </div>
            </div>
          ))}

          {/* Salon owners */}
          <div className="rounded-2xl border border-gold-500/30 bg-gold-500/8 p-5">
            <h3 className="font-semibold text-fg">Already listed on {SITE.name}?</h3>
            <p className="mt-1 text-sm text-fg-muted">
              Use the in-dashboard support form for faster assistance.
            </p>
            <Link
              href="/salon-dashboard/support"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
            >
              Go to Support →
            </Link>
          </div>
        </div>

        {/* Contact form */}
        <ContactForm />
      </div>

      {/* FAQ */}
      <section className="mt-14 animate-fade-in-up delay-200">
        <h2 className="font-display text-2xl font-bold">Frequently Asked</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            {
              q: "How do I list my salon?",
              a: 'Click "List Your Salon" in the top nav and fill out the form. Your listing is reviewed within 24 hours.',
            },
            {
              q: "Is it free for customers?",
              a: "Yes! Searching, comparing and booking is completely free. You only pay the salon directly.",
            },
            {
              q: "How do I report a booking issue?",
              a: "Use the form above or email team.getsalons@gmail.com with your booking number.",
            },
            {
              q: "Can I cancel a booking?",
              a: "Yes, from your dashboard. Free cancellation up to 2 hours before the appointment.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-line bg-card p-5"
            >
              <h3 className="font-semibold text-fg">{item.q}</h3>
              <p className="mt-1.5 text-sm text-fg-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
