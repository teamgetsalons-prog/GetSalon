import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config — imported by middleware.
 * MUST NOT import mongoose, nodemailer or any Node-only module.
 * The Credentials provider (which needs the DB) lives in ./index.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "customer";
        token.salonId = user.salonId;
      }
      if (trigger === "update" && session) {
        // Allow client-side session refresh (e.g. after creating a salon)
        if (session.salonId) token.salonId = session.salonId as string;
        if (session.name) token.name = session.name as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role =
          (token.role as import("@/types").UserRole) ?? "customer";
        session.user.salonId = token.salonId as string | undefined;
      }
      return session;
    },
  },
  providers: [], // filled in ./index.ts (Node runtime only)
} satisfies NextAuthConfig;
