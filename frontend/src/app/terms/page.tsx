import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@getsalons/shared/constants";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = buildMetadata({
  title: `Terms of Service | ${SITE.shortName}`,
  description: `Read the ${SITE.name} terms of service. Understand the rules and guidelines for using our salon discovery and booking platform in Pakistan.`,
  path: "/terms",
});

const lastUpdated = "January 1, 2025";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: "/terms" },
        ])}
      />

      <nav aria-label="Breadcrumb" className="py-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">Terms of Service</span>
      </nav>

      <article className="prose-custom animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-fg-faint">Last updated: {lastUpdated}</p>

        <div className="mt-8 space-y-8 text-fg-muted leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-fg">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using {SITE.name} (&quot;the Platform&quot;), you agree
              to be bound by these Terms of Service (&quot;Terms&quot;). If you do not
              agree to these Terms, you may not use the Platform. These Terms
              constitute a legally binding agreement between you and {SITE.name}.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">2. Description of Service</h2>
            <p className="mt-3">
              {SITE.name} is a salon discovery and booking platform that connects
              customers with beauty service providers (salons, barbers, spas and
              parlours) across Pakistan. Our services include:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Searching and discovering salons by location, service and rating.</li>
              <li>Viewing salon profiles, menus, pricing and verified reviews.</li>
              <li>Booking appointments online in real time.</li>
              <li>Managing bookings, rescheduling and cancelling.</li>
              <li>Leaving verified reviews after completed appointments.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">3. Account Registration</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You must provide accurate and complete registration information.</li>
              <li>You are responsible for maintaining the confidentiality of your password.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>You must notify us immediately of any unauthorised use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">4. Booking and Cancellation</h2>
            <h3 className="mt-4 text-lg font-semibold text-fg">4.1 Making a Booking</h3>
            <p className="mt-3">
              When you book an appointment through {SITE.name}, you are making a
              binding commitment to attend at the scheduled time. The booking is
              a direct contract between you and the salon.
            </p>
            <h3 className="mt-4 text-lg font-semibold text-fg">4.2 Cancellation Policy</h3>
            <p className="mt-3">
              You may cancel a booking at any time before the appointment
              through the Platform. Late cancellations (within 2 hours of the
              appointment) or no-shows may result in restrictions on future
              bookings. Salon-specific cancellation policies may apply and will
              be displayed on the salon&apos;s profile.
            </p>
            <h3 className="mt-4 text-lg font-semibold text-fg">4.3 Payment</h3>
            <p className="mt-3">
              Payment for services is made directly to the salon at the time of
              the appointment unless online payment is explicitly offered.
              {SITE.name} does not set prices — all pricing is determined by the
              individual salon.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">5. Reviews and Content</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Reviews must be based on actual bookings made through the Platform.</li>
              <li>You may not post reviews for salons you have not visited.</li>
              <li>Reviews must not contain hate speech, harassment, personal attacks or false claims.</li>
              <li>We reserve the right to remove reviews that violate these guidelines.</li>
              <li>Salon owners may respond to reviews but may not alter or delete customer reviews.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">6. Prohibited Conduct</h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the Platform for any unlawful purpose.</li>
              <li>Create multiple accounts to circumvent restrictions.</li>
              <li>Attempt to gain unauthorised access to other accounts or systems.</li>
              <li>Interfere with or disrupt the Platform or its servers.</li>
              <li>Scrape, crawl or use automated tools to extract data from the Platform.</li>
              <li>Post false, misleading or fraudulent content.</li>
              <li>Impersonate another person or entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">7. Intellectual Property</h2>
            <p className="mt-3">
              All content on {SITE.name} — including logos, text, graphics,
              software and design — is the property of {SITE.name} or its
              licensors and is protected by copyright, trademark and other
              intellectual property laws. You may not reproduce, distribute or
              create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">8. Limitation of Liability</h2>
            <p className="mt-3">
              {SITE.name} acts as an intermediary between customers and salons.
              We are not a party to the service agreement between you and the
              salon. We do not guarantee the quality, safety or legality of
              services provided by salons.
            </p>
            <p className="mt-3">
              To the maximum extent permitted by law, {SITE.name} shall not be
              liable for any indirect, incidental, special, consequential or
              punitive damages arising out of your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">9. Indemnification</h2>
            <p className="mt-3">
              You agree to indemnify and hold harmless {SITE.name}, its officers,
              directors, employees and agents from any claims, losses or expenses
              arising from your use of the Platform or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">10. Termination</h2>
            <p className="mt-3">
              We may suspend or terminate your account at any time, without
              prior notice, for conduct that violates these Terms or is harmful
              to other users, the Platform or third parties. You may also delete
              your account at any time from your settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">11. Governing Law</h2>
            <p className="mt-3">
              These Terms are governed by and construed in accordance with the
              laws of Pakistan. Any disputes shall be subject to the exclusive
              jurisdiction of the courts of Lahore, Pakistan.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">12. Changes to These Terms</h2>
            <p className="mt-3">
              We reserve the right to modify these Terms at any time. We will
              notify you of material changes by posting the updated Terms on
              this page. Continued use of the Platform after changes constitutes
              acceptance.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">13. Contact</h2>
            <p className="mt-3">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@getsalons.pk" className="text-gold hover:underline">
                legal@getsalons.pk
              </a>
              {" "}or visit our{" "}
              <Link href="/contact" className="text-gold hover:underline">
                Contact Page
              </Link>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
