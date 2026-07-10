import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { ok, fail } from "../middleware/error-handler.js";
import { authenticate, signToken } from "../middleware/auth.js";
import { registerSchema, loginSchema } from "../../../shared/dist/validations/auth.js";
import type { Request, Response } from "express";

const router = Router();

// Frontend (Vercel) and backend (Render) live on different registrable
// domains, so the auth cookie needs SameSite=None to be sent on
// cross-site fetch requests - which browsers only allow when paired with
// Secure. Locally, frontend/backend share "localhost" as their site
// (only the port differs), so SameSite=None there would be either
// unnecessary or rejected outright (Secure requires HTTPS).
const isProd = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

router.post("/register", async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);

  const exists = await User.findOne({ email: input.email });
  if (exists) return fail(res, "An account with this email already exists.", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: input.role,
  });

  return ok(res, { id: user._id.toString(), email: user.email, role: user.role }, undefined, 201);
});

router.post("/login", async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);

  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  if (!user || !user.passwordHash) return fail(res, "Invalid email or password.", 401);

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) return fail(res, "Invalid email or password.", 401);

  if (user.isActive === false) return fail(res, "Account is deactivated.", 403);

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    salonId: user.salon?.toString(),
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

  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone || undefined;
  if (req.body.avatar !== undefined) user.avatar = req.body.avatar || undefined;
  if (req.body.city !== undefined) user.city = req.body.city || undefined;

  await user.save();
  return ok(res, { name: user.name, phone: user.phone, avatar: user.avatar, city: user.city });
});

export { router as authRoutes };
export default router;
