import type { NextRequest } from "next/server";
import { handleApiError, ok, requireUser } from "@/server/api-helpers";
import { reviewActionSchema } from "@/lib/validations/review";
import { reviewAction } from "@/server/services/review.service";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/reviews/:id — reply / helpful / report / hide / publish */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = reviewActionSchema.parse(await req.json());

    const review = await reviewAction(id, user, input);

    return ok(
      {
        id: review._id.toString(),
        helpfulCount: review.helpfulVotes.length,
        status: review.status,
        reply: review.reply,
      },
      { message: "Done." }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
