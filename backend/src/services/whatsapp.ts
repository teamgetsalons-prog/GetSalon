/**
 * WhatsApp notification architecture (future-ready).
 *
 * The rest of the codebase only calls `sendWhatsApp()`. Swapping in a real
 * provider (WhatsApp Cloud API, Twilio, UltraMsg…) means adding one adapter
 * here and setting WHATSAPP_PROVIDER — zero changes elsewhere.
 */

export interface WhatsAppMessage {
  to: string; // E.164 or local 03XX format
  text: string;
}

interface WhatsAppAdapter {
  name: string;
  send(msg: WhatsAppMessage): Promise<void>;
}

/** Dev adapter: logs the message instead of sending */
const consoleAdapter: WhatsAppAdapter = {
  name: "console",
  async send(msg) {
    console.log(`[whatsapp:console] to=${msg.to}: ${msg.text}`);
  },
};

/** WhatsApp Cloud API adapter skeleton — activate by setting env vars */
const cloudApiAdapter: WhatsAppAdapter = {
  name: "cloud-api",
  async send(msg) {
    const url = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_API_TOKEN;
    if (!url || !token) {
      console.warn("[whatsapp] cloud-api selected but env vars missing");
      return;
    }
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePkNumber(msg.to),
        type: "text",
        text: { body: msg.text },
      }),
    });
  },
};

const adapters: Record<string, WhatsAppAdapter> = {
  console: consoleAdapter,
  "cloud-api": cloudApiAdapter,
};

/** "03001234567" -> "923001234567" */
export function normalizePkNumber(num: string): string {
  const digits = num.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.startsWith("92")) return digits;
  return digits;
}

export async function sendWhatsApp(msg: WhatsAppMessage): Promise<void> {
  const adapter =
    adapters[process.env.WHATSAPP_PROVIDER || "console"] ?? consoleAdapter;
  try {
    await adapter.send(msg);
  } catch (err) {
    console.error(`[whatsapp:${adapter.name}] send failed:`, err);
  }
}
