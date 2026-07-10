import Link from "next/link";
import { Scissors } from "lucide-react";
import { SITE } from "@/lib/constants";

const columns = [
  {
    title: "Discover",
    links: [
      { label: "Find Salons", href: "/salons" },
      { label: "Top Salons", href: "/top-salons" },
      { label: "Salons in Lahore", href: "/salons?city=lahore" },
      { label: "Salons in Karachi", href: "/salons?city=karachi" },
      { label: "Salons in Islamabad", href: "/salons?city=islamabad" },
      { label: "Beauty Blog", href: "/blog" },
    ],
  },
  {
    title: "For Business",
    links: [
      { label: "List Your Salon", href: "/partner" },
      { label: "Partner Login", href: "/login" },
      { label: "Pricing & Plans", href: "/partner#plans" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "FAQs", href: "/#faq" },
      { label: "Contact", href: "mailto:hello@getsalons.pk" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-soft/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-gold-950">
              <Scissors className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-bold">
              Salon<span className="text-gold">Hub</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">
            {SITE.tagline}. Discover, compare and book beauty services across
            Pakistan — free for customers.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-faint">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-fg-muted transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-fg-faint">
        © {new Date().getFullYear()} {SITE.name}. Made with ♥ in Pakistan.
      </div>
    </footer>
  );
}
