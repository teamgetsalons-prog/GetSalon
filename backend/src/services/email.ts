import { Resend } from "resend";
import { SITE } from "../../../shared/dist/constants.js";

/**
 * Email delivery via Resend API.
 * Gracefully no-ops (with a log) when RESEND_API_KEY is missing,
 * so development works without an email account.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  _resend = new Resend(apiKey);
  return _resend;
}

function baseTemplate(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#161616;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #2a2a2a;">
              <span style="font-size:20px;font-weight:700;color:#e8b426;">✂ ${escapeHtml(SITE.shortName)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;">${escapeHtml(title)}</h1>
              <div style="font-size:15px;line-height:1.6;color:#c9c9c9;">${bodyHtml}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2a2a2a;font-size:12px;color:#777;">
              ${escapeHtml(SITE.name)} — ${escapeHtml(SITE.tagline)}<br/>
              <a href="${SITE.url}" style="color:#e8b426;text-decoration:none;">${escapeHtml(SITE.url)}</a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends an email via Resend. Never throws - callers that need to log a
 * sent/failed status can use the returned boolean; callers that don't care
 * can just fire-and-forget (e.g. via notify()).
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  title: string;
  html: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log(
      `[email:skipped] to=${opts.to} subject="${opts.subject}" (RESEND_API_KEY not configured)`
    );
    return false;
  }
  try {
    // The Resend SDK reports API-level failures (bad key, unverified
    // domain, etc.) via a `{ error }` result rather than a thrown
    // exception - awaiting the call alone is not enough to know it worked.
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || process.env.SMTP_FROM || `GetSalons <onboarding@resend.dev>`,
      to: opts.to,
      subject: opts.subject,
      html: baseTemplate(opts.title, opts.html),
    });
    if (error) {
      console.error(`[email] send failed: to=${opts.to} subject="${opts.subject}"`, error);
      return false;
    }
    return true;
  } catch (err) {
    // Never let a mail failure break a booking flow
    console.error("[email] send failed:", err);
    return false;
  }
}

/** Shared CTA button, used by templates that link somewhere actionable
 * (admin approval, password reset) - booking emails are informational only
 * and don't use it. */
function ctaButtonHtml(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="border-radius:10px;background:#e8b426;">
        <a href="${url}" target="_blank" rel="noopener noreferrer"
          style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#0a0a0a;text-decoration:none;">
          ${escapeHtml(label)}
        </a>
      </td></tr>
    </table>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
      <td style="padding:8px 0;color:#888;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
      <td style="padding:8px 0 8px 16px;color:#fff;font-size:14px;text-align:right;font-weight:600;">${escapeHtml(value)}</td>
    </tr>`;
}

export function bookingEmailHtml(b: {
  bookingNumber: string;
  salonName: string;
  serviceName: string;
  staffName?: string;
  date: string;
  time: string;
  price: number;
  address?: string;
}): string {
  return `
    <p>Here are your appointment details:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:#1e1e1e;border:1px solid #2f2f2f;border-radius:12px;padding:8px 20px;margin:16px 0;">
      ${detailRow("Booking #", b.bookingNumber)}
      ${detailRow("Salon", b.salonName)}
      ${detailRow("Service", b.serviceName)}
      ${b.staffName ? detailRow("Specialist", b.staffName) : ""}
      ${detailRow("Date", b.date)}
      ${detailRow("Time", b.time)}
      ${detailRow("Price", `Rs ${b.price.toLocaleString("en-PK")}`)}
      ${b.address ? detailRow("Address", b.address) : ""}
    </table>
    <p style="color:#888;font-size:13px;">Manage your booking anytime from your GetSalons dashboard.</p>`;
}

/** Sent to the salon owner when a customer books an appointment - distinct
 * from bookingEmailHtml (the customer's own confirmation) since the owner
 * needs the customer's contact details instead of a price/address recap. */
export function ownerBookingNotificationEmailHtml(b: {
  bookingId: string;
  salonName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  serviceName: string;
  staffName?: string;
  date: string;
  time: string;
  notes?: string;
}): string {
  return `
    <p>You have a new appointment request at <strong>${escapeHtml(b.salonName)}</strong>:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:#1e1e1e;border:1px solid #2f2f2f;border-radius:12px;padding:8px 20px;margin:16px 0;">
      ${detailRow("Customer", b.customerName)}
      ${b.customerEmail ? detailRow("Email", b.customerEmail) : ""}
      ${detailRow("Phone", b.customerPhone)}
      ${detailRow("Service", b.serviceName)}
      ${b.staffName ? detailRow("Staff", b.staffName) : ""}
      ${detailRow("Date", b.date)}
      ${detailRow("Time", b.time)}
      ${detailRow("Booking ID", b.bookingId)}
    </table>
    ${b.notes ? `<p style="color:#c9c9c9;"><strong>Notes from customer:</strong><br/>${escapeHtml(b.notes)}</p>` : ""}
    <p style="color:#888;font-size:13px;">Manage this booking from your GetSalons salon dashboard.</p>`;
}

/** Sent to ADMIN_EMAIL when a salon owner submits a new listing for review. */
export function salonSubmittedEmailHtml(s: {
  salonName: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  services: string[];
  listingId: string;
  submittedAt: string;
  reviewUrl: string;
}): string {
  return `
    <p>A new salon listing was submitted and needs your review:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:#1e1e1e;border:1px solid #2f2f2f;border-radius:12px;padding:8px 20px;margin:16px 0;">
      ${detailRow("Salon", s.salonName)}
      ${detailRow("Owner", s.ownerName)}
      ${detailRow("Owner email", s.ownerEmail)}
      ${detailRow("Phone", s.phone)}
      ${detailRow("Address", s.address)}
      ${detailRow("City", s.city)}
      ${s.province ? detailRow("Province/State", s.province) : ""}
      ${s.services.length ? detailRow("Services", s.services.join(", ")) : ""}
      ${detailRow("Listing ID", s.listingId)}
      ${detailRow("Submitted", s.submittedAt)}
    </table>
    ${ctaButtonHtml("Review Salon Listing", s.reviewUrl)}
    <p style="color:#888;font-size:13px;">The listing stays hidden from customers until it's approved.</p>`;
}

/** Sent to a user who requested a password reset. resetUrl already includes
 * the raw (unhashed) token as a query param. */
export function passwordResetEmailHtml(resetUrl: string): string {
  return `
    <p>We received a request to reset the password on your GetSalons account.</p>
    <p>Click the button below to choose a new password. This link is valid for <strong>30 minutes</strong>.</p>
    ${ctaButtonHtml("Reset Password", resetUrl)}
    <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email — your password will stay unchanged.</p>`;
}
