import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { Comment } from "@/server/models";
import {
  clientIp,
  fail,
  handleApiError,
  ok,
  rateLimit,
  requireUser,
} from "@/server/api-helpers";
import { createComment, getSalonComments } from "@/server/services/comment.service";
import { z } from "zod";

const createCommentSchema = z.object({
  salonId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3).max(2000),
  photos: z.array(z.string().url()).max(5).optional(),
});

/** GET /api/comments?salonId=&page= — public, paginated */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const salonId = sp.get("salonId");
    if (!salonId) return fail("salonId is required.");

    const page = Math.max(1, Number(sp.get("page")) || 1);
    const limit = Math.min(50, Number(sp.get("limit")) || 10);

    const result = await getSalonComments(salonId, page, limit);

    return ok(result.comments, {
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/comments — logged-in user comments on a salon */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    rateLimit(`comment:${user.id}:${clientIp(req)}`, 10, 60 * 60 * 1000);

    const body = await req.json();
    const input = createCommentSchema.parse(body);

    const comment = await createComment(user.id, input);

    return ok(
      {
        _id: comment._id.toString(),
        rating: comment.rating,
        comment: comment.comment,
        photos: comment.photos,
        createdAt: comment.createdAt.toISOString(),
      },
      { message: "Thank you for your review!" },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
