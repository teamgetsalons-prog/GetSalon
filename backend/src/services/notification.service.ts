import { Notification } from "../models/index.js";
import type { NotificationType } from "@/types";
import { sendEmail } from "./email.js";
import { sendWhatsApp } from "./whatsapp.js";

/**
 * Unified notification fan-out: in-app record + optional email + optional
 * WhatsApp. Individual channel failures never throw — bookings must succeed
 * even if a mail server is down.
 */
export async function notify(opts: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  email?: { to: string; subject: string; html: string };
  whatsapp?: { to: string; text: string };
}): Promise<void> {
  try {
    await Notification.create({
      user: opts.userId,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      link: opts.link,
    });
  } catch (err) {
    console.error("[notify] in-app notification failed:", err);
  }

  if (opts.email) {
    await sendEmail({
      to: opts.email.to,
      subject: opts.email.subject,
      title: opts.title,
      html: opts.email.html,
    });
  }

  if (opts.whatsapp?.to) {
    await sendWhatsApp(opts.whatsapp);
  }
}
