import type {
  PaymentGateway,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from "./types";

/**
 * PayFast Payment Gateway
 *
 * Integration: PayFast (South Africa) - supports PKR via international merchants
 * Docs: https://developers.payfast.co.za
 *
 * Environment variables required:
 * - PAYFAST_MERCHANT_ID
 * - PAYFAST_MERCHANT_KEY
 * - PAYFAST_RETURN_URL
 * - PAYFAST_CANCEL_URL
 * - PAYFAST_NOTIFY_URL
 * - PAYFAST_API_URL (sandbox: https://sandbox.payfast.co.za/eng/process)
 */
export class PayFastGateway implements PaymentGateway {
  name = "payfast" as const;
  displayName = "PayFast";

  private merchantId: string;
  private merchantKey: string;
  private apiUrl: string;

  constructor() {
    this.merchantId = process.env.PAYFAST_MERCHANT_ID || "";
    this.merchantKey = process.env.PAYFAST_MERCHANT_KEY || "";
    this.apiUrl = process.env.PAYFAST_API_URL || "https://sandbox.payfast.co.za/eng/process";
  }

  private isConfigured(): boolean {
    return !!(this.merchantId && this.merchantKey);
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        gateway: "payfast",
        error: "PayFast gateway not configured. Set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY.",
      };
    }

    try {
      const params = new URLSearchParams({
        merchant_id: this.merchantId,
        merchant_key: this.merchantKey,
        return_url: request.returnUrl,
        cancel_url: request.returnUrl,
        notify_url: request.callbackUrl,
        m_payment_id: request.invoiceNumber,
        amount: request.amount.toFixed(2),
        item_name: request.description,
        item_description: `GetSalons - ${request.description}`,
        currency_code: "PKR",
        name_first: request.customerName,
        email_address: request.customerEmail || "",
        cell_number: request.customerPhone,
      });

      // Add custom_str for metadata
      if (request.metadata) {
        Object.entries(request.metadata).forEach(([key, value]) => {
          params.set(`custom_${key}`, value);
        });
      }

      return {
        success: true,
        gateway: "payfast",
        transactionId: request.invoiceNumber,
        paymentUrl: `${this.apiUrl}?${params.toString()}`,
      };
    } catch {
      return {
        success: false,
        gateway: "payfast",
        error: "Failed to initialize PayFast payment",
      };
    }
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    // PayFast uses ITN (Instant Transaction Notification) - verify via server-to-server
    // For now, return pending status - webhook will handle verification
    return {
      success: false,
      status: "pending",
      transactionId: request.transactionId,
      error: "PayFast verification handled via webhook",
    };
  }

  async handleWebhook(payload: unknown) {
    const data = payload as Record<string, string>;

    // PayFast ITN verification: echo back the payload with verify=true
    // Real implementation would POST back to PayFast for verification
    return {
      transactionId: data.m_payment_id || "",
      status: data.payment_status === "COMPLETE" ? "paid" as const : "failed" as const,
    };
  }
}
