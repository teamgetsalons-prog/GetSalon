import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { Review } from "@/server/models";
import {
  clientIp,
  fail,
  handleApiError,
  ok,
  rateLimit,
  requireUser,
} from "@/server/api-helpers";
import { createReviewSchema } from "@/lib/validations/review";
import { createReview } from "@/server/services/review.service";

/** GET /api/reviews?salonId=&page= — public, paginated */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const salonId = sp.get("salonId");
    if (!salonId) return fail("salonId is required.");

    const page = Math.max(1, Number(sp.get("page")) || 1);
    const limit = Math.min(50, Number(sp.get("limit")) || 10);

    await connectDB();
    const filter = { salon: salonId, status: "published" as const };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("customer", "name avatar")
        .populate("staff", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return ok(reviews, {
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/reviews — customer reviews a completed booking */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    rateLimit(`review:${user.id}:${clientIp(req)}`, 5, 60 * 60 * 1000);

    const input = createReviewSchema.parse(await req.json());
    const review = await createReview(user.id, input);

    return ok(
      { id: review._id.toString() },
      { message: "Thank you! Your review is now live." },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
