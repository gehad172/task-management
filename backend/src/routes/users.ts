import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../models/User.js";

const router = Router();

const notificationPrefsSchema = z.object({
  inApp: z
    .object({
      teamInvite: z.boolean().optional(),
      taskAssigned: z.boolean().optional(),
      deadline: z.boolean().optional(),
    })
    .optional(),
  email: z
    .object({
      teamInvite: z.boolean().optional(),
      taskAssigned: z.boolean().optional(),
      deadline: z.boolean().optional(),
    })
    .optional(),
});

const updateMeSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(80).optional(),
      bio: z.string().trim().max(500).optional(),
      avatar: z.string().trim().min(1).optional(),
      notificationPrefs: notificationPrefsSchema.optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.bio !== undefined ||
        data.avatar !== undefined ||
        data.notificationPrefs !== undefined,
      { message: "At least one field must be provided" },
    ),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

function serializeMe(doc: any) {
  return {
    id: String(doc._id),
    name: String(doc.name ?? "User"),
    email: String(doc.email ?? ""),
    avatar: doc.avatar ? String(doc.avatar) : null,
    bio: String(doc.bio ?? ""),
    notificationPrefs: doc.notificationPrefs ?? {
      inApp: { teamInvite: true, taskAssigned: true, deadline: true },
      email: { teamInvite: false, taskAssigned: false, deadline: false },
    },
  };
}

router.get("/me", authenticate, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const user = await User.findById(userId).select("_id name email avatar bio notificationPrefs").lean();
  if (!user || Array.isArray(user)) throw new AppError("User not found", 404);
  res.json({ user: serializeMe(user) });
}));

router.patch("/me", authenticate, validate(updateMeSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const body = req.body as z.infer<typeof updateMeSchema>["body"];

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (body.name !== undefined) user.name = body.name;
  if (body.bio !== undefined) (user as any).bio = body.bio;
  if (body.avatar !== undefined) user.avatar = body.avatar;

  if (body.notificationPrefs) {
    const current = (user as any).notificationPrefs ?? {};
    (user as any).notificationPrefs = {
      inApp: { ...current.inApp, ...body.notificationPrefs.inApp },
      email: { ...current.email, ...body.notificationPrefs.email },
    };
  }

  await user.save();
  const fresh = await User.findById(userId).select("_id name email avatar bio notificationPrefs").lean();
  res.json({ user: serializeMe(fresh) });
}));

router.patch("/me/password", authenticate, validate(changePasswordSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const body = req.body as z.infer<typeof changePasswordSchema>["body"];

  const user = await User.findById(userId).select("_id password");
  if (!user) throw new AppError("User not found", 404);
  if (!user.password) throw new AppError("Password login is not enabled for this account", 400);

  const ok = await bcrypt.compare(body.currentPassword, user.password);
  if (!ok) throw new AppError("Current password is incorrect", 400);

  user.password = await bcrypt.hash(body.newPassword, 10);
  await user.save();

  res.json({ ok: true });
}));

export { router as userRoutes };

