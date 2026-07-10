import type {
  PaymentGateway,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from "./types";

/**
 * JazzCash Payment Gateway
 *
 * Integration: JazzCash Mobile Account API
 * Docs: https://developer.jazzcash.com.pk
 *
 * Environment variables required:
 * - JAZZCASH_MERCHANT_ID
 * - JAZZCASH_PASSWORD
 * - JAZZCASH_RETURN_URL
 * - JAZZCASH_API_URL (sandbox: https://sandbox.jazzcash.com.pk)
 */
export class JazzCashGateway implements PaymentGateway {
  name = "jazzcash" as const;
  displayName = "JazzCash";

  private merchantId: string;
  private password: string;
  private apiUrl: string;

  constructor() {
    this.merchantId = process.env.JAZZCASH_MERCHANT_ID || "";
    this.password = process.env.JAZZCASH_PASSWORD || "";
    this.apiUrl = process.env.JAZZCASH_API_URL || "https://sandbox.jazzcash.com.pk";
  }

  private isConfigured(): boolean {
    return !!(this.merchantId && this.password);
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        gateway: "jazzcash",
        error: "JazzCash gateway not configured. Set JAZZCASH_MERCHANT_ID and JAZZCASH_PASSWORD.",
      };
    }

    try {
      const res = await fetch(`${this.apiUrl}/api/v1/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mid: this.merchantId,
          password: this.password,
          amount: request.amount * 100, // JazzCash expects paisa
          orderId: request.invoiceNumber,
          storeName: "GetSalons Pakistan",
          mobileAccountNo: request.customerPhone,
          returnUrl: request.returnUrl,
          callbackUrl: request.callbackUrl,
        }),
      });

      const data = await res.json();

      if (data.responseCode === "0000") {
        return {
          success: true,
          gateway: "jazzcash",
          transactionId: data.transactionId,
          paymentUrl: data.payUrl,
          deepLink: data.deepLink,
        };
      }

      return {
        success: false,
        gateway: "jazzcash",
        error: data.responseMessage || "JazzCash payment initiation failed",
      };
    } catch {
      return {
        success: false,
        gateway: "jazzcash",
        error: "Network error communicating with JazzCash",
      };
    }
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "failed", transactionId: request.transactionId, error: "Gateway not configured" };
    }

    try {
      const res = await fetch(`${this.apiUrl}/api/v1/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mid: this.merchantId,
          password: this.password,
          orderId: request.transactionId,
        }),
      });

      const data = await res.json();

      return {
        success: data.responseCode === "0000",
        status: data.responseCode === "0000" ? "paid" : "failed",
        transactionId: request.transactionId,
        paidAt: data.responseCode === "0000" ? new Date() : undefined,
        error: data.responseCode === "0000" ? undefined : data.responseMessage,
      };
    } catch {
      return { success: false, status: "failed", transactionId: request.transactionId, error: "Verification failed" };
    }
  }

  async handleWebhook(payload: unknown) {
    const data = payload as { orderId?: string; responseCode?: string };
    return {
      transactionId: data.orderId || "",
      status: data.responseCode === "0000" ? "paid" as const : "failed" as const,
    };
  }
}
