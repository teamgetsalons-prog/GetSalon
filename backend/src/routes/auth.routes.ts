import { Router } from "express";
import bcrypt from "bcryptjs";
import { User, Salon } from "../models/index.js";
import { ok, fail } from "../middleware/error-handler.js";
import { authenticate, signToken, authCookieOptions } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rate-limit.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../../shared/dist/validations/auth.js";
import { generateResetToken, hashToken } from "../utils/token.js";
import { sendEmail, passwordResetEmailHtml } from "../services/email.js";
import { SITE } from "../../../shared/dist/constants.js";
import type { Request, Response } from "express";

const router = Router();

router.post("/register", authLimiter, async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);

  const exists = await User.findOne({ email: input.email });
  if (exists) return fail(res, "An account with this email already exists.", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: "customer",
  });

  return ok(res, { id: user._id.toString(), email: user.email, role: user.role }, undefined, 201);
});

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);

  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  if (!user || !user.passwordHash) return fail(res, "Invalid email or password.", 401);

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) return fail(res, "Invalid email or password.", 401);

  if (user.isActive === false) return fail(res, "Account is deactivated.", 403);

  // The token's salonId is what the frontend middleware and the salon
  // dashboard resolve the owner's salon from. Owners who created their salon
  // before user.salon was linked at creation time get healed here.
  let salonId = user.salon?.toString();
  if (!salonId && user.role === "owner") {
    const salon = await Salon.findOne({ owner: user._id }).select("_id");
    if (salon) {
      salonId = salon._id.toString();
      await User.updateOne({ _id: user._id }, { salon: salon._id });
    }
  }

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    salonId,
  });

  res.cookie("getsalons_token", token, authCookieOptions);

  return ok(res, {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("getsalons_token", authCookieOptions);
  return ok(res, { message: "Logged out." });
});

router.get("/session", authenticate, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).select("name email phone avatar role city");
  if (!user) return fail(res, "User not found.", 404);
  return ok(res, user.toJSON());
});

router.patch("/session", authenticate, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) return fail(res, "User not found.", 404);

  const input = updateProfileSchema.parse(req.body);
  if (input.name !== undefined) user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone || undefined;
  if (input.avatar !== undefined) user.avatar = input.avatar || undefined;
  if (input.city !== undefined) user.city = input.city || undefined;

  await user.save();
  return ok(res, { name: user.name, phone: user.phone, avatar: user.avatar, city: user.city });
});

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

router.post("/forgot-password", authLimiter, async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.parse(req.body);

  // Never reveal whether an account exists - always return the same
  // response and take the same amount of visible action either way.
  const user = await User.findOne({ email: input.email.toLowerCase().trim() });
  if (user) {
    const { token, tokenHash } = generateResetToken();
    await User.updateOne(
      { _id: user._id },
      { passwordResetTokenHash: tokenHash, passwordResetExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) }
    );

    const resetUrl = `${SITE.url}/reset-password?token=${token}`;
    const sent = await sendEmail({
      to: user.email,
      subject: "Reset Your GetSalons Password",
      title: "Reset your password",
      html: passwordResetEmailHtml(resetUrl),
    });
    console.log(
      `[email:password-reset] userId=${user._id} email=${user.email} at=${new Date().toISOString()} status=${sent ? "sent" : "failed"}`
    );
  }

  return ok(res, { message: GENERIC_FORGOT_PASSWORD_MESSAGE });
});

router.post("/reset-password", authLimiter, async (req: Request, res: Response) => {
  const input = resetPasswordSchema.parse(req.body);
  const tokenHash = hashToken(input.token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });
  if (!user) {
    return fail(res, "This reset link is invalid or has expired. Please request a new one.", 400);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  // Single-use: clearing the token hash means this exact link can never be
  // replayed, even if someone intercepts it after the fact.
  await User.updateOne(
    { _id: user._id },
    { passwordHash, $unset: { passwordResetTokenHash: "", passwordResetExpires: "" } }
  );

  console.log(`[password-reset] userId=${user._id} email=${user.email} at=${new Date().toISOString()} status=success`);

  return ok(res, { message: "Your password has been reset. You can now log in." });
});

export { router as authRoutes };
export default router;
