import { Router } from "express";
import bcrypt from "bcryptjs";
import { User, Salon } from "../models/index.js";
import { ok, fail } from "../middleware/error-handler.js";
import { authenticate, signToken, authCookieOptions } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rate-limit.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../../../shared/dist/validations/auth.js";
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

export { router as authRoutes };
export default router;
