import { connectDB } from "@/server/db";
import { Salon } from "@/server/models";

export interface WhatsAppClickEvent {
  salonId: string;
  customerId?: string;
  message?: string;
  timestamp: Date;
}

/** Generate WhatsApp URL with pre-filled message */
export function generateWhatsAppUrl(
  phoneNumber: string,
  salonName: string,
  message?: string
): string {
  const cleaned = phoneNumber.replace(/[^\d]/g, "").replace(/^0/, "92");
  const defaultMessage = `Hi! I found ${salonName} on GetSalons and would like to ask about booking.`;
  const encoded = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

/** Track WhatsApp click */
export async function trackWhatsAppClick(event: WhatsAppClickEvent) {
  await connectDB();

  // Update salon's WhatsApp click count
  await Salon.updateOne(
    { _id: event.salonId },
    { $inc: { "analytics.whatsappClicks": 1 } }
  );

  // Store the event for analytics
  // This could be expanded to a separate analytics collection
  return { success: true };
}

/** Get WhatsApp analytics for a salon */
export async function getWhatsAppAnalytics(salonId: string) {
  await connectDB();

  const salon = await Salon.findById(salonId).select("whatsapp analytics");
  if (!salon) return null;

  return {
    whatsappNumber: salon.whatsapp,
    clicks: (salon as any).analytics?.whatsappClicks || 0,
  };
}
