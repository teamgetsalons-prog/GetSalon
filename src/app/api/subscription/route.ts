import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { connectDB } from "@/server/db";
import { Salon } from "@/server/models";
import {
  getSalonSubscription,
  initiateSubscriptionUpgrade,
  directUpgradeSubscription,
  getPaymentHistory,
  getSubscriptionStatus,
} from "@/server/services/subscription.service";
import { handleApiError, ok, fail, requireUser } from "@/server/api-helpers";
import { z } from "zod";

const upgradeSchema = z.object({
  plan: z.enum(["basic", "premium"]),
  paymentMethod: z.enum(["easypaisa", "jazzcash", "payfast", "stripe"]).default("easypaisa"),
});

const directUpgradeSchema = z.object({
  plan: z.enum(["basic", "premium"]),
});

/** GET /api/subscription — Get current subscription + payment history */
export async function GET() {
  try {
    const user = await requireUser();

    await connectDB();
    const salon = await Salon.findOne({ owner: user.id });
    if (!salon) return fail("No salon found.", 404);

    const salonId = salon._id.toString();
    const [subscription, paymentHistory, status] = await Promise.all([
      getSalonSubscription(salonId),
      getPaymentHistory(salonId),
      getSubscriptionStatus(salonId),
    ]);

    return ok({ subscription, paymentHistory, status });
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/subscription — Upgrade or renew subscription */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    // Check if this is a direct upgrade (demo/testing)
    const directParsed = directUpgradeSchema.safeParse(body);
    if (directParsed.success) {
      await connectDB();
      const salon = await Salon.findOne({ owner: user.id });
      if (!salon) return fail("No salon found.", 404);

      const subscription = await directUpgradeSubscription(
        salon._id.toString(),
        directParsed.data.plan
      );
      return ok(subscription, { message: "Subscription upgraded successfully" });
    }

    // Regular upgrade with payment gateway
    const input = upgradeSchema.parse(body);

    await connectDB();
    const salon = await Salon.findOne({ owner: user.id });
    if (!salon) return fail("No salon found.", 404);

    const result = await initiateSubscriptionUpgrade(
      salon._id.toString(),
      input.plan,
      input.paymentMethod
    );

    return ok({
      subscription: result.subscription,
      payment: result.payment,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: err.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return handleApiError(err);
  }
}
