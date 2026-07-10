import type { DefaultSession } from "next-auth";
import type { UserRole } from "./index";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      salonId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    salonId?: string;
  }
}
// Note: `next-auth/jwt` re-exports @auth/core/jwt via `export *`, which
// cannot be augmented from here. Token custom fields are cast at the single
// read site in src/server/auth/auth.config.ts instead.
