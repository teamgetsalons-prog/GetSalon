/**
 * Payment Gateway Registry
 *
 * Central registry for all payment gateways.
 * Supports lazy initialization based on environment configuration.
 *
 * Usage:
 *   import { paymentGateway } from "@/server/payment";
 *   const result = await paymentGateway("easypaisa").initPayment({...});
 */

import type { PaymentGateway, PaymentMethod } from "./types";
import { EasyPaisaGateway } from "./easypaisa";
import { JazzCashGateway } from "./jazzcash";
import { PayFastGateway } from "./payfast";
import { StripeGateway } from "./stripe";

const gateways: Partial<Record<PaymentMethod, PaymentGateway>> = {};

function getGateway(method: PaymentMethod): PaymentGateway {
  if (!gateways[method]) {
    switch (method) {
      case "easypaisa":
        gateways[method] = new EasyPaisaGateway();
        break;
      case "jazzcash":
        gateways[method] = new JazzCashGateway();
        break;
      case "payfast":
        gateways[method] = new PayFastGateway();
        break;
      case "stripe":
        gateways[method] = new StripeGateway();
        break;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
  return gateways[method]!;
}

export function paymentGateway(method: PaymentMethod): PaymentGateway {
  return getGateway(method);
}

export function availableGateways(): PaymentMethod[] {
  const all: PaymentMethod[] = ["easypaisa", "jazzcash", "payfast", "stripe"];
  return all.filter((m) => {
    try {
      const gw = getGateway(m);
      // Check if configured by trying to init a dummy payment
      return true; // All registered gateways are available
    } catch {
      return false;
    }
  });
}

export function isGatewayConfigured(method: PaymentMethod): boolean {
  try {
    const gw = getGateway(method);
    // Simple check: see if env vars are set
    switch (method) {
      case "easypaisa":
        return !!(process.env.EASYPAISA_MERCHANT_ID && process.env.EASYPAISA_MERCHANT_PASSWORD);
      case "jazzcash":
        return !!(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD);
      case "payfast":
        return !!(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);
      case "stripe":
        return !!process.env.STRIPE_SECRET_KEY;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export type { PaymentGateway, PaymentMethod, PaymentInitRequest, PaymentInitResponse, PaymentVerifyRequest, PaymentVerifyResponse, PaymentRefundRequest, PaymentRefundResponse, GatewayPaymentStatus } from "./types";
