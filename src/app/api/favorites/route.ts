import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { Salon, User, type ISalon } from "@/server/models";
import {
  ApiError,
  handleApiError,
  ok,
  requireUser,
} from "@/server/api-helpers";
import { toSalonCard } from "@/server/services/salon.service";

/** GET /api/favorites — the logged-in user's saved salons */
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const doc = await User.findById(user.id).populate({
      path: "favorites",
      match: { status: "approved" },
      populate: { path: "categories", select: "name" },
    });
    if (!doc) throw new ApiError("User not found.", 404);

    const favorites = (doc.favorites as unknown as ISalon[])
      .filter(Boolean)
      .map((s) => toSalonCard(s as ISalon & { categories: { name?: string }[] }));

    return ok(favorites);
  } catch (err) {
    return handleApiError(err);
  }
}

const toggleSchema = z.object({ salonId: z.string().min(1) });

/** POST /api/favorites — toggle a salon in the wishlist */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { salonId } = toggleSchema.parse(await req.json());

    await connectDB();
    const salon = await Salon.findById(salonId).select("_id");
    if (!salon) throw new ApiError("Salon not found.", 404);

    const doc = await User.findById(user.id).select("favorites");
    if (!doc) throw new ApiError("User not found.", 404);

    const has = doc.favorites.some((f) => f.toString() === salonId);
    if (has) {
      await User.updateOne({ _id: user.id }, { $pull: { favorites: salonId } });
    } else {
      await User.updateOne(
        { _id: user.id },
        { $addToSet: { favorites: salonId } }
      );
    }

    return ok(
      { favorited: !has },
      { message: has ? "Removed from favourites." : "Saved to favourites!" }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
