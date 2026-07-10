import type {
  PaymentGateway,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  PaymentRefundRequest,
  PaymentRefundResponse,
} from "./types";

/**
 * EasyPaisa Payment Gateway
 *
 * Integration: Telenor Microfinance Bank EasyPaisa API
 * Docs: https://developer.easypaisa.com.pk
 *
 * Environment variables required:
 * - EASYPAISA_MERCHANT_ID
 * - EASYPAISAERCHANT_PASSWORD
 * - EASYPAISA_RETURN_URL
 * - EASYPAISA_CALLBACK_URL
 * - EASYPAISA_API_URL (sandbox: https://sandbox.easypaisa.com.pk)
 */
export class EasyPaisaGateway implements PaymentGateway {
  name = "easypaisa" as const;
  displayName = "EasyPaisa";

  private merchantId: string;
  private merchantPassword: string;
  private apiUrl: string;

  constructor() {
    this.merchantId = process.env.EASYPAISA_MERCHANT_ID || "";
    this.merchantPassword = process.env.EASYPAISA_MERCHANT_PASSWORD || "";
    this.apiUrl = process.env.EASYPAISA_API_URL || "https://sandbox.easypaisa.com.pk";
  }

  private isConfigured(): boolean {
    return !!(this.merchantId && this.merchantPassword);
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        gateway: "easypaisa",
        error: "EasyPaisa gateway not configured. Set EASYPAISA_MERCHANT_ID and EASYPAISA_MERCHANT_PASSWORD.",
      };
    }

    try {
      // Step 1: Get access token
      const tokenRes = await fetch(`${this.apiUrl}/api/AccessToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mid: this.merchantId,
          password: this.merchantPassword,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.accessToken) {
        return { success: false, gateway: "easypaisa", error: "Failed to get EasyPaisa access token" };
      }

      // Step 2: Initiate transaction
      const transactionRes = await fetch(`${this.apiUrl}/api/Passport/MicroService/Passport/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.accessToken}`,
        },
        body: JSON.stringify({
          mid: this.merchantId,
          schemeId: "12345",
          amount: request.amount,
          storeName: "GetSalons Pakistan",
          returnUrl: request.returnUrl,
          callbackUrl: request.callbackUrl,
          orderId: request.invoiceNumber,
        }),
      });

      const transactionData = await transactionRes.json();

      if (transactionData.responseCode === "0000") {
        return {
          success: true,
          gateway: "easypaisa",
          transactionId: transactionData.transactionId,
          paymentUrl: transactionData.payUrl,
          deepLink: transactionData.deepLink,
        };
      }

      return {
        success: false,
        gateway: "easypaisa",
        error: transactionData.responseMessage || "EasyPaisa payment initiation failed",
      };
    } catch (error) {
      return {
        success: false,
        gateway: "easypaisa",
        error: "Network error communicating with EasyPaisa",
      };
    }
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "failed", transactionId: request.transactionId, error: "Gateway not configured" };
    }

    try {
      const tokenRes = await fetch(`${this.apiUrl}/api/AccessToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mid: this.merchantId,
          password: this.merchantPassword,
        }),
      });

      const tokenData = await tokenRes.json();

      const res = await fetch(`${this.apiUrl}/api/Passport/MicroService/Passport/Verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.accessToken}`,
        },
        body: JSON.stringify({
          mid: this.merchantId,
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

  async handleWebhook(payload: unknown, headers: Record<string, string>) {
    const data = payload as { orderId?: string; responseCode?: string; transactionId?: string };

    return {
      transactionId: data.orderId || data.transactionId || "",
      status: data.responseCode === "0000" ? "paid" as const : "failed" as const,
    };
  }
}
