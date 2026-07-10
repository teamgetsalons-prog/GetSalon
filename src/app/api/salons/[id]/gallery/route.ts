import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { Salon } from "@/server/models";
import {
  ApiError,
  handleApiError,
  ok,
  requireRole,
} from "@/server/api-helpers";
import { deleteImage } from "@/server/services/upload.service";

type Params = { params: Promise<{ id: string }> };

async function loadOwnedSalon(id: string, userId: string, role: string) {
  await connectDB();
  const salon = await Salon.findById(id);
  if (!salon) throw new ApiError("Salon not found.", 404);
  if (role !== "admin" && salon.owner.toString() !== userId) {
    throw new ApiError("Not allowed.", 403);
  }
  return salon;
}

const addSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  caption: z.string().max(120).optional(),
});

/** POST /api/salons/:id/gallery — attach an uploaded image */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole("owner", "admin");
    const { id } = await params;
    const salon = await loadOwnedSalon(id, user.id, user.role);

    const input = addSchema.parse(await req.json());
    salon.gallery.push(input);
    await salon.save();

    return ok(salon.gallery, { message: "Photo added to gallery." }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

const removeSchema = z.object({ url: z.string().url() });

/** DELETE /api/salons/:id/gallery — remove an image */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole("owner", "admin");
    const { id } = await params;
    const salon = await loadOwnedSalon(id, user.id, user.role);

    const { url } = removeSchema.parse(await req.json());
    const image = salon.gallery.find((g) => g.url === url);
    if (image?.publicId) await deleteImage(image.publicId);

    salon.set(
      "gallery",
      salon.gallery.filter((g) => g.url !== url)
    );
    await salon.save();

    return ok(salon.gallery, { message: "Photo removed." });
  } catch (err) {
    return handleApiError(err);
  }
}
