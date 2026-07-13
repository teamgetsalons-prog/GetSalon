import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@getsalons/shared/constants";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = buildMetadata({
  title: `Privacy Policy | ${SITE.shortName}`,
  description: `Read the ${SITE.name} privacy policy. Learn how we collect, use, protect and share your personal information when you use our salon discovery and booking platform.`,
  path: "/privacy",
});

const lastUpdated = "January 1, 2025";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />

      <nav aria-label="Breadcrumb" className="py-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">Privacy Policy</span>
      </nav>

      <article className="prose-custom animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-fg-faint">Last updated: {lastUpdated}</p>

        <div className="mt-8 space-y-8 text-fg-muted leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-fg">1. Introduction</h2>
            <p className="mt-3">
              Welcome to {SITE.name} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to
              protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose and safeguard your information when you use
              our website, mobile applications and related services
              (collectively, the &quot;Platform&quot;).
            </p>
            <p className="mt-3">
              By using {SITE.name}, you agree to the collection and use of
              information in accordance with this policy. If you do not agree,
              please discontinue use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">2. Information We Collect</h2>
            <h3 className="mt-4 text-lg font-semibold text-fg">2.1 Information You Provide</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Account Information:</strong> Name, email address, phone number and password when you create an account.</li>
              <li><strong>Booking Details:</strong> Service preferences, appointment dates and special requests when you make a booking.</li>
              <li><strong>Payment Information:</strong> Payment method details processed securely through our third-party payment processors. We do not store full card numbers.</li>
              <li><strong>Reviews and Ratings:</strong> Content you submit in reviews, ratings or feedback.</li>
              <li><strong>Communications:</strong> Messages you send us through the Platform or support channels.</li>
            </ul>
            <h3 className="mt-4 text-lg font-semibold text-fg">2.2 Information Collected Automatically</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Device Information:</strong> Browser type, operating system, device model and screen resolution.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, search queries and interaction patterns.</li>
              <li><strong>Location Data:</strong> City-level location (from your IP address) to show relevant salons. We do not access precise GPS location without your explicit consent.</li>
              <li><strong>Cookies:</strong> Session and authentication cookies required for the Platform to function.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">3. How We Use Your Information</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>To provide, maintain and improve the Platform and its features.</li>
              <li>To process bookings and send appointment confirmations.</li>
              <li>To communicate with you about bookings, account changes and service updates.</li>
              <li>To personalise your experience and show relevant salons and services.</li>
              <li>To detect, prevent and address fraud, abuse and technical issues.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">4. How We Share Your Information</h2>
            <p className="mt-3">
              We do not sell your personal information. We may share your
              information with:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Salons:</strong> When you make a booking, the salon receives your name, phone number and booking details to fulfil the appointment.</li>
              <li><strong>Service Providers:</strong> Third-party companies that help us operate the Platform (hosting, payment processing, analytics). They are contractually bound to protect your data.</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation or legal process.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition or sale of assets, with prior notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">5. Data Security</h2>
            <p className="mt-3">
              We implement industry-standard security measures including
              encryption in transit (TLS/HTTPS), encryption at rest, access
              controls and regular security audits. However, no method of
              transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">6. Data Retention</h2>
            <p className="mt-3">
              We retain your information for as long as your account is active
              or as needed to provide the Platform. When you delete your account,
              we remove your personal data within 30 days, except where we need
              to retain certain information for legal, accounting or business
              purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">7. Your Rights</h2>
            <p className="mt-3">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access and receive a copy of your personal data.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to or restrict the processing of your data.</li>
              <li>Withdraw consent at any time (where processing is based on consent).</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:team@getsalons.com" className="text-gold hover:underline">
                team@getsalons.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">8. Children&apos;s Privacy</h2>
            <p className="mt-3">
              {SITE.name} is not intended for children under 13. We do not
              knowingly collect personal information from children. If we become
              aware that a child has provided us with personal information, we
              will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">9. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the &quot;Last updated&quot; date. Your continued
              use of the Platform after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">10. Contact Us</h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Email:{" "}
                <a href="mailto:team@getsalons.com" className="text-gold hover:underline">
                  team@getsalons.com
                </a>
              </li>
              <li>Website:{" "}
                <Link href="/contact" className="text-gold hover:underline">
                  Contact Page
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
