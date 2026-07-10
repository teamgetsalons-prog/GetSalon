import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { Staff } from "../models/index.js";
import { staffSchema } from "../../../shared/dist/validations/service.js";
import { getActorSalon } from "../services/salon.service.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const salonId = req.query.salonId as string;
  if (!salonId) return fail(res, "salonId is required.");

  const staff = await Staff.find({ salon: salonId, isActive: true })
    .populate("services", "name")
    .sort({ "rating.average": -1 });

  return ok(res, staff);
});

router.post("/", authenticate, requireRole("owner", "admin"), async (req: Request, res: Response) => {
  const salon = await getActorSalon(req.user!);
  if (!salon) return fail(res, "Create your salon profile first.", 404);

  const input = staffSchema.parse(req.body);

  const member = await Staff.create({
    salon: salon._id,
    name: input.name,
    title: input.title || undefined,
    bio: input.bio || undefined,
    avatar: input.avatar || undefined,
    services: input.serviceIds,
    workingHours: input.workingHours ?? [],
    isActive: input.isActive,
  });

  return ok(res, member.toJSON(), undefined, 201);
});

router.patch("/:id", authenticate, requireRole("owner", "staff", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const salon = await getActorSalon(req.user!);
  if (!salon) return fail(res, "Salon not found.", 404);

  const member = await Staff.findOne({ _id: id, salon: salon._id });
  if (!member) return fail(res, "Staff member not found.", 404);

  const input = staffSchema.partial().parse(req.body);
  const leave = req.body;

  if (input.name !== undefined) member.name = input.name;
  if (input.title !== undefined) member.title = input.title || undefined;
  if (input.bio !== undefined) member.bio = input.bio || undefined;
  if (input.avatar !== undefined) member.avatar = input.avatar || undefined;
  if (input.serviceIds !== undefined) member.set("services", input.serviceIds);
  if (input.workingHours !== undefined) member.set("workingHours", input.workingHours);
  if (input.isActive !== undefined) member.isActive = input.isActive;

  if (leave.addLeave) {
    if (!member.leaves.some((l: { date: string }) => l.date === leave.addLeave.date)) {
      member.leaves.push(leave.addLeave);
    }
  }
  if (leave.removeLeaveDate) {
    member.set("leaves", member.leaves.filter((l: { date: string }) => l.date !== leave.removeLeaveDate));
  }

  await member.save();
  return ok(res, member.toJSON());
});

router.delete("/:id", authenticate, requireRole("owner", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const salon = await getActorSalon(req.user!);
  if (!salon) return fail(res, "Salon not found.", 404);

  const member = await Staff.findOne({ _id: id, salon: salon._id });
  if (!member) return fail(res, "Staff member not found.", 404);

  member.isActive = false;
  await member.save();

  return ok(res, { id });
});

export { router as staffRoutes };
export default router;
