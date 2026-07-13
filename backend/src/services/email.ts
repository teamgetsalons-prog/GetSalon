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

export async function sendEmail(opts: {
  to: string;
  subject: string;
  title: string;
  html: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(
      `[email:skipped] to=${opts.to} subject="${opts.subject}" (RESEND_API_KEY not configured)`
    );
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.SMTP_FROM || `GetSalons <onboarding@resend.dev>`,
      to: opts.to,
      subject: opts.subject,
      html: baseTemplate(opts.title, opts.html),
    });
  } catch (err) {
    // Never let a mail failure break a booking flow
    console.error("[email] send failed:", err);
  }
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
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:8px 0;color:#888;font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;font-weight:600;">${escapeHtml(value)}</td>
    </tr>`;

  return `
    <p>Here are your appointment details:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:#1e1e1e;border:1px solid #2f2f2f;border-radius:12px;padding:8px 20px;margin:16px 0;">
      ${row("Booking #", b.bookingNumber)}
      ${row("Salon", b.salonName)}
      ${row("Service", b.serviceName)}
      ${b.staffName ? row("Specialist", b.staffName) : ""}
      ${row("Date", b.date)}
      ${row("Time", b.time)}
      ${row("Price", `Rs ${b.price.toLocaleString("en-PK")}`)}
      ${b.address ? row("Address", b.address) : ""}
    </table>
    <p style="color:#888;font-size:13px;">Manage your booking anytime from your GetSalons dashboard.</p>`;
}
