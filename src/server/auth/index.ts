import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/server/db";
import { Salon, User } from "@/server/models";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "./auth.config";

/**
 * Full NextAuth instance (Node runtime).
 * Route handlers, server components and server actions import from here.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectDB();
        const user = await User.findOne({
          email: email.toLowerCase(),
          isActive: true,
        }).select("+passwordHash");

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Attach the owner's salon id so dashboards resolve without lookups
        let salonId: string | undefined;
        if (user.role === "owner") {
          const salon = await Salon.findOne({ owner: user._id }).select("_id");
          salonId = salon?._id.toString();
        } else if (user.role === "staff" && user.salon) {
          salonId = user.salon.toString();
        }

        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          salonId,
        };
      },
    }),
    // Google login — future-ready: activates automatically once env vars exist
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google]
      : []),
  ],
});
