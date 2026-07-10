import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/server/db";
import { User } from "@/server/models";
import {
  clientIp,
  fail,
  handleApiError,
  ok,
  rateLimit,
} from "@/server/api-helpers";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    rateLimit(`register:${clientIp(req)}`, 5, 15 * 60 * 1000);

    const body = await req.json();
    const input = registerSchema.parse(body);

    await connectDB();

    const exists = await User.findOne({ email: input.email });
    if (exists) {
      return fail("An account with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await User.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
    });

    return ok(
      { id: user._id.toString(), email: user.email, role: user.role },
      { message: "Account created. You can now log in." },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
