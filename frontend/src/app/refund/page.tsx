import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@getsalons/shared/constants";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = buildMetadata({
  title: `Refund & Cancellation Policy | ${SITE.shortName}`,
  description: `Read the ${SITE.name} refund and cancellation policy. Learn about booking cancellations, refund eligibility and how to request a refund for salon services booked through our platform.`,
  path: "/refund",
});

const lastUpdated = "January 1, 2025";

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Refund & Cancellation Policy", path: "/refund" },
        ])}
      />

      <nav aria-label="Breadcrumb" className="py-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">Refund &amp; Cancellation Policy</span>
      </nav>

      <article className="prose-custom animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="mt-2 text-sm text-fg-faint">Last updated: {lastUpdated}</p>

        <div className="mt-8 space-y-8 text-fg-muted leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-fg">1. Overview</h2>
            <p className="mt-3">
              At {SITE.name}, we aim to provide a seamless booking experience.
              This policy explains how cancellations and refunds work when you
              book a salon service through our platform. Please note that{" "}
              {SITE.name} acts as a booking intermediary — the actual service is
              provided by the salon.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">2. Cancellation by Customer</h2>
            <h3 className="mt-4 text-lg font-semibold text-fg">2.1 Free Cancellation</h3>
            <p className="mt-3">
              You may cancel your booking free of charge at any time{" "}
              <strong>up to 2 hours before</strong> your scheduled appointment.
              Your booking will be cancelled immediately and you will receive a
              confirmation notification.
            </p>
            <h3 className="mt-4 text-lg font-semibold text-fg">2.2 Late Cancellation</h3>
            <p className="mt-3">
              Cancellations made <strong>within 2 hours</strong> of the
              appointment time are considered late cancellations. While {SITE.name}{" "}
              does not charge any fees, the salon may enforce its own late
              cancellation policy. Please check the salon&apos;s profile for
              details.
            </p>
            <h3 className="mt-4 text-lg font-semibold text-fg">2.3 No-Show</h3>
            <p className="mt-3">
              If you do not attend your appointment without cancelling, it will
              be marked as a &quot;no-show.&quot; Repeated no-shows may result in
              restrictions on future bookings on the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">3. Cancellation by Salon</h2>
            <p className="mt-3">
              Salons may cancel a booking due to unforeseen circumstances (e.g.,
              staff illness, emergency closures). In such cases:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You will be notified immediately via the Platform.</li>
              <li>If you have already paid online, a full refund will be issued to your original payment method within 5-7 business days.</li>
              <li>We will help you find an alternative salon if desired.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">4. Refund Eligibility</h2>
            <h3 className="mt-4 text-lg font-semibold text-fg">4.1 Refundable Situations</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>The salon cancelled your appointment.</li>
              <li>You cancelled more than 2 hours before the appointment and paid online.</li>
              <li>The service was not delivered as described on the salon&apos;s profile.</li>
              <li>You were charged incorrectly (overcharge or duplicate charge).</li>
            </ul>
            <h3 className="mt-4 text-lg font-semibold text-fg">4.2 Non-Refundable Situations</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>No-shows without prior cancellation.</li>
              <li>Cancellations made after the appointment time.</li>
              <li>Services already rendered at the salon.</li>
              <li>Dissatisfaction with service quality (these should be reported as a review or through support).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">5. How to Request a Refund</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                <strong>Log in</strong> to your {SITE.name} account and go to
                &quot;Your Appointments.&quot;
              </li>
              <li>
                <strong>Select</strong> the booking you want to report.
              </li>
              <li>
                <strong>Contact us</strong> through the support form on your
                dashboard or email us at{" "}
                <a href="mailto:support@getsalons.pk" className="text-gold hover:underline">
                  support@getsalons.pk
                </a>
                {" "}with your booking number and reason for the refund request.
              </li>
              <li>
                We will review your request and respond within{" "}
                <strong>2-3 business days</strong>.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">6. Refund Processing</h2>
            <p className="mt-3">Approved refunds are processed as follows:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Online payments:</strong> Refunded to the original payment method within 5-7 business days.</li>
              <li><strong>Cash payments:</strong> Refunds for cash payments are coordinated directly with the salon.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">7. Disputes</h2>
            <p className="mt-3">
              If you disagree with a refund decision, you may appeal by emailing{" "}
              <a href="mailto:disputes@getsalons.pk" className="text-gold hover:underline">
                disputes@getsalons.pk
              </a>
              {" "}with additional details. Our team will conduct a thorough
              review and provide a final decision within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">8. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this policy from time to time. Material changes will
              be communicated via email or through the Platform. Continued use
              after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-fg">9. Contact</h2>
            <p className="mt-3">
              For refund or cancellation enquiries, reach us at:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Email:{" "}
                <a href="mailto:support@getsalons.pk" className="text-gold hover:underline">
                  support@getsalons.pk
                </a>
              </li>
              <li>WhatsApp:{" "}
                <a href="https://wa.me/923001234567" className="text-gold hover:underline">
                  +92 300 1234567
                </a>
              </li>
              <li>Dashboard:{" "}
                <Link href="/salon-dashboard/support" className="text-gold hover:underline">
                  Contact Support
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
