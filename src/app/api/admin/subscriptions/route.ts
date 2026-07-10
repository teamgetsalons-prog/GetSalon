import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { connectDB } from "@/server/db";
import { Salon } from "@/server/models";
import {
  getAllSubscriptions,
  extendTrial,
  suspendSubscription,
  getSubscriptionAnalytics,
  directUpgradeSubscription,
} from "@/server/services/subscription.service";
import { ApiError, handleApiError, ok, fail, requireUser } from "@/server/api-helpers";
import { z } from "zod";

const extendTrialSchema = z.object({
  salonId: z.string(),
  additionalDays: z.coerce.number().min(1).max(365),
});

const suspendSchema = z.object({
  salonId: z.string(),
  reason: z.string().optional(),
});

const upgradeSchema = z.object({
  salonId: z.string(),
  plan: z.enum(["basic", "premium"]),
});

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new ApiError("Unauthorized", 403);
  }
  return user;
}

/** GET /api/admin/subscriptions — List subscriptions with filters */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const plan = searchParams.get("plan") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const analytics = searchParams.get("analytics") === "true";

    if (analytics) {
      const data = await getSubscriptionAnalytics();
      return ok(data);
    }

    const result = await getAllSubscriptions({ page, limit, plan, status, search });
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

/** PATCH /api/admin/subscriptions — Admin actions (extend trial, suspend, upgrade) */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const extendParsed = extendTrialSchema.safeParse(body);
    if (extendParsed.success) {
      const result = await extendTrial(
        extendParsed.data.salonId,
        extendParsed.data.additionalDays
      );
      return ok(result, { message: `Trial extended by ${extendParsed.data.additionalDays} days` });
    }

    const suspendParsed = suspendSchema.safeParse(body);
    if (suspendParsed.success) {
      const result = await suspendSubscription(
        suspendParsed.data.salonId,
        suspendParsed.data.reason
      );
      return ok(result, { message: "Subscription suspended" });
    }

    const upgradeParsed = upgradeSchema.safeParse(body);
    if (upgradeParsed.success) {
      const result = await directUpgradeSubscription(
        upgradeParsed.data.salonId,
        upgradeParsed.data.plan
      );
      return ok(result, { message: `Upgraded to ${upgradeParsed.data.plan}` });
    }

    return fail("Invalid action", 400);
  } catch (err) {
    return handleApiError(err);
  }
}
