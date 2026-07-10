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
 * Stripe Payment Gateway (stub for future integration)
 *
 * Docs: https://stripe.com/docs/api
 *
 * Environment variables required:
 * - STRIPE_SECRET_KEY
 * - STRIPE_PUBLISHABLE_KEY
 * - STRIPE_WEBHOOK_SECRET
 */
export class StripeGateway implements PaymentGateway {
  name = "stripe" as const;
  displayName = "Stripe";

  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || "";
  }

  private isConfigured(): boolean {
    return !!this.secretKey;
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        gateway: "stripe",
        error: "Stripe gateway not configured. Set STRIPE_SECRET_KEY.",
      };
    }

    // Future: Create Stripe Payment Intent
    // const stripe = new Stripe(this.secretKey);
    // const intent = await stripe.paymentIntents.create({
    //   amount: request.amount * 100, // Stripe expects cents
    //   currency: "pkr",
    //   metadata: { invoiceNumber: request.invoiceNumber, ...request.metadata },
    // });

    return {
      success: true,
      gateway: "stripe",
      transactionId: `stripe_stub_${request.invoiceNumber}`,
      paymentUrl: `https://checkout.stripe.com/stub/${request.invoiceNumber}`,
    };
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "failed", transactionId: request.transactionId, error: "Gateway not configured" };
    }

    // Future: Retrieve Stripe Payment Intent
    // const intent = await stripe.paymentIntents.retrieve(request.transactionId);

    return {
      success: false,
      status: "pending",
      transactionId: request.transactionId,
      error: "Stripe verification stub - not yet implemented",
    };
  }

  async refundPayment(request: PaymentRefundRequest): Promise<PaymentRefundResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "failed", error: "Gateway not configured" };
    }

    // Future: Create Stripe Refund
    // const refund = await stripe.refunds.create({ payment_intent: request.transactionId, amount: request.amount * 100 });

    return {
      success: false,
      status: "refunded",
      error: "Stripe refund stub - not yet implemented",
    };
  }
}
