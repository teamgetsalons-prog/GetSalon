import { Router } from "express";
import type { Request, Response } from "express";
import { User, Salon } from "../models/index.js";
import { ok, fail } from "../middleware/error-handler.js";
import { signToken, authCookieOptions } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rate-limit.js";
import { getEnv } from "../config.js";

const router = Router();

/**
 * POST /auth/google
 *
 * Accepts a Google ID token (from Google Identity Services on the frontend),
 * verifies it with Google's servers, and creates or finds the matching user.
 * Returns the same session cookie as normal login.
 *
 * Body: { credential: string }  — the JWT ID token from Google
 */
router.post("/google", authLimiter, async (req: Request, res: Response) => {
  const { credential } = req.body as { credential?: string };
  if (!credential) return fail(res, "Google credential is required.", 400);

  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID) {
    return fail(res, "Google sign-in is not configured on this server.", 503);
  }

  // ── Verify the token with Google ──────────────────────────
  let payload: {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  };

  try {
    // Google's tokeninfo endpoint validates the JWT and returns the payload
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!googleRes.ok) {
      return fail(res, "Invalid Google token.", 401);
    }

    const tokenInfo = (await googleRes.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: string;
      aud?: string;
    };

    // Verify the token was issued for our app
    if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
      return fail(res, "Google token was not issued for this application.", 401);
    }

    // Check email verification
    if (tokenInfo.email_verified === "false" || !tokenInfo.email) {
      return fail(res, "Please verify your email with Google first.", 401);
    }

    payload = {
      sub: tokenInfo.sub,
      email: tokenInfo.email,
      name: tokenInfo.name,
      picture: tokenInfo.picture,
      email_verified: tokenInfo.email_verified === "true",
    };
  } catch (err) {
    console.error("[auth/google] Token verification failed:", err);
    return fail(res, "Failed to verify Google token.", 501);
  }

  // ── Find or create user ───────────────────────────────────
  try {
    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      // Create a new customer account
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        avatar: payload.picture,
        role: "customer",
        emailVerifiedAt: new Date(),
        isActive: true,
      });
    } else {
      // Update existing user with Google info if needed
      if (!user.avatar && payload.picture) {
        user.avatar = payload.picture;
      }
      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
      }
      user.lastLoginAt = new Date();
      await user.save();
    }

    if (!user.isActive) {
      return fail(res, "Your account has been deactivated.", 403);
    }

    // ── Resolve salonId for owners ────────────────────────
    let salonId = user.salon?.toString();
    if (!salonId && user.role === "owner") {
      const salon = await Salon.findOne({ owner: user._id }).select("_id");
      if (salon) {
        salonId = salon._id.toString();
        await User.updateOne({ _id: user._id }, { salon: salon._id });
      }
    }

    // ── Sign JWT and set cookie ────────────────────────────
    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      salonId,
      name: user.name,
      email: user.email,
    });

    res.cookie("getsalons_token", token, authCookieOptions);

    return ok(res, {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("[auth/google] User creation/login error:", err);
    return fail(res, "Failed to sign in with Google.", 500);
  }
});

export { router as googleAuthRoutes };
export default router;
