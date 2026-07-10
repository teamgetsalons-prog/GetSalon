import type { NextRequest } from "next/server";
import {
  clientIp,
  fail,
  handleApiError,
  ok,
  rateLimit,
  requireUser,
} from "@/server/api-helpers";
import { uploadImage } from "@/server/services/upload.service";

/** POST /api/upload — multipart image upload (any logged-in user) */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    rateLimit(`upload:${user.id}:${clientIp(req)}`, 20, 60 * 60 * 1000);

    const form = await req.formData();
    const file = form.get("file");
    const folder = (form.get("folder") as string) || "misc";

    if (!(file instanceof File)) {
      return fail("Attach an image under the 'file' field.");
    }

    const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "misc";
    const result = await uploadImage(file, safeFolder);

    return ok(result, { message: "Image uploaded." }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
