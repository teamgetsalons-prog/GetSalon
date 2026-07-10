import type { NextRequest } from "next/server";
import {
  clientIp,
  handleApiError,
  ok,
  rateLimit,
  requireRole,
} from "@/server/api-helpers";
import { createSalonSchema, searchSalonsSchema } from "@/lib/validations/salon";
import { createSalon, searchSalons } from "@/server/services/salon.service";

/** GET /api/salons — public search with filters */
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const input = searchSalonsSchema.parse(params);
    const result = await searchSalons(input);

    return ok(result.salons, {
      pagination: {
        page: result.page,
        limit: input.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/salons — owner registers their salon (goes to admin approval) */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("customer", "owner", "admin");
    rateLimit(`salon-create:${clientIp(req)}`, 3, 60 * 60 * 1000);

    const input = createSalonSchema.parse(await req.json());
    const salon = await createSalon(user.id, input);

    return ok(
      { id: salon._id.toString(), slug: salon.slug, status: salon.status },
      { message: "Salon submitted! Our team will review it within 24–48 hours." },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
