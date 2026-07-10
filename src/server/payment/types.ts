/**
 * Modular Payment Gateway Architecture
 *
 * Each gateway implements PaymentGateway interface.
 * To add a new gateway: create a file, implement the interface, register in index.ts.
 *
 * Supported: EasyPaisa, JazzCash, PayFast, Stripe (stub)
 */

export type PaymentMethod = "easypaisa" | "jazzcash" | "payfast" | "stripe";
export type GatewayPaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "refunded";

export interface PaymentInitRequest {
  amount: number;
  currency: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  description: string;
  returnUrl: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentInitResponse {
  success: boolean;
  gateway: PaymentMethod;
  transactionId?: string;
  paymentUrl?: string;
  deepLink?: string;
  qrCode?: string;
  error?: string;
}

export interface PaymentVerifyRequest {
  transactionId: string;
  gateway: PaymentMethod;
}

export interface PaymentVerifyResponse {
  success: boolean;
  status: GatewayPaymentStatus;
  transactionId: string;
  amount?: number;
  paidAt?: Date;
  error?: string;
}

export interface PaymentRefundRequest {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface PaymentRefundResponse {
  success: boolean;
  refundId?: string;
  status: GatewayPaymentStatus;
  error?: string;
}

export interface PaymentGateway {
  name: PaymentMethod;
  displayName: string;
  initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse>;
  verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse>;
  refundPayment?(request: PaymentRefundRequest): Promise<PaymentRefundResponse>;
  handleWebhook?(payload: unknown, headers: Record<string, string>): Promise<{
    transactionId: string;
    status: GatewayPaymentStatus;
    metadata?: Record<string, unknown>;
  }>;
}
