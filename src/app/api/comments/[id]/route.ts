import type { NextRequest } from "next/server";
import { handleApiError, ok, requireUser } from "@/server/api-helpers";
import { voteHelpful, deleteComment } from "@/server/services/comment.service";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const actionSchema = z.object({
  action: z.enum(["helpful"]),
});

/** PATCH /api/comments/:id — vote helpful */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = actionSchema.parse(body);

    const result = await voteHelpful(id, user.id);

    return ok(result, { message: "Done." });
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/comments/:id — delete own comment */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    await deleteComment(id, user.id, user.role || "customer");

    return ok(null, { message: "Comment deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
