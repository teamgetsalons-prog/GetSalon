import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { completeSubscriptionPayment } from "@/server/services/subscription.service";
import { paymentGateway, type PaymentGateway } from "@/server/payment";
import type { GatewayPaymentStatus } from "@/server/payment/types";

function extractGatewayFields(
  payload: Record<string, unknown>
): { transactionId: string; invoiceNumber: string; status: string } {
  return {
    transactionId: String(payload.transactionId || payload.txnId || payload.payment_id || ""),
    invoiceNumber: String(payload.invoiceNumber || payload.invoice_id || ""),
    status: String(payload.status || payload.payment_status || ""),
  };
}

/** POST /api/subscription/webhook — Handle payment gateway callbacks */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const gatewayName = req.nextUrl.searchParams.get("gateway") || "easypaisa";

    const allowedGateways = ["easypaisa", "jazzcash", "payfast", "stripe"] as const;
    if (!allowedGateways.includes(gatewayName as typeof allowedGateways[number])) {
      return NextResponse.json({ error: "Unknown gateway" }, { status: 400 });
    }

    const gateway = paymentGateway(gatewayName as "easypaisa" | "jazzcash" | "payfast" | "stripe");

    // Verify signature via handleWebhook if available
    if (gateway.handleWebhook) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        headers[key] = value;
      });
      try {
        await gateway.handleWebhook(body, headers);
      } catch {
        return NextResponse.json({ error: "Webhook verification failed" }, { status: 401 });
      }
    }

    const { transactionId, invoiceNumber, status } = extractGatewayFields(body);

    if (!invoiceNumber) {
      return NextResponse.json({ error: "Missing invoice number" }, { status: 400 });
    }

    // Map gateway status to our status
    let paymentStatus: "paid" | "failed";
    if (
      status === "completed" ||
      status === "successful" ||
      status === "paid" ||
      status === "SUCCESS"
    ) {
      paymentStatus = "paid";
    } else {
      paymentStatus = "failed";
    }

    await completeSubscriptionPayment(invoiceNumber, transactionId, paymentStatus);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
