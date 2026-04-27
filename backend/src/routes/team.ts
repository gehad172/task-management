import { Router } from "express";
import mongoose from "mongoose";
import validator from "validator";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { Notification } from "../models/Notification.js";

const router = Router();

const roleSchema = z.enum(["admin", "editor", "viewer"]);

const inviteSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .refine((val) => validator.isEmail(val), { message: "Invalid email" }),
    role: roleSchema.optional().default("viewer"),
  }),
});

const memberIdParamsSchema = z.object({
  params: z.object({
    memberId: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Invalid member id" }),
  }),
});

const updateRoleSchema = z.object({
  params: memberIdParamsSchema.shape.params,
  body: z.object({
    role: roleSchema,
  }),
});

async function loadWorkspace(ownerId: string) {
  const workspace = await Workspace.findOne({ ownerId: new mongoose.Types.ObjectId(ownerId) }).lean();
  return workspace && !Array.isArray(workspace) ? workspace : null;
}

function serializeMember(user: { _id: mongoose.Types.ObjectId; name?: unknown; email?: unknown; avatar?: unknown }, role: string) {
  return {
    id: String(user._id),
    name: user.name ? String(user.name) : "User",
    email: user.email ? String(user.email) : "",
    avatar: user.avatar ? String(user.avatar) : null,
    role,
  };
}

router.get("/members", authenticate, asyncHandler(async (req, res) => {
  const ownerId = req.userId!;
  const workspace = await loadWorkspace(ownerId);
  if (!workspace) {
    res.json({ members: [] });
    return;
  }

  const memberIds = (workspace.members ?? []).map((m: any) => m.userId).filter(Boolean);
  if (!memberIds.length) {
    res.json({ members: [] });
    return;
  }

  const users = await User.find({ _id: { $in: memberIds } }).select("_id name email avatar").lean();
  const map = new Map(users.map((u: any) => [String(u._id), u]));

  const members = (workspace.members ?? [])
    .map((m: any) => {
      const u = map.get(String(m.userId));
      if (!u) return null;
      return serializeMember(u, String(m.role ?? "viewer"));
    })
    .filter(Boolean)
    .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));

  res.json({ members });
}));

router.post("/invite", authenticate, validate(inviteSchema), asyncHandler(async (req, res) => {
  const ownerId = req.userId!;
  const body = req.body as z.infer<typeof inviteSchema>["body"];

  const user = await User.findOne({ email: body.email.toLowerCase() }).select("_id name email avatar").lean();
  if (!user || Array.isArray(user)) {
    throw new AppError("User not found", 404);
  }

  if (String((user as any)._id) === ownerId) {
    throw new AppError("You are already a member", 400);
  }

  const workspace = await Workspace.findOneAndUpdate(
    { ownerId: new mongoose.Types.ObjectId(ownerId) },
    { $setOnInsert: { ownerId: new mongoose.Types.ObjectId(ownerId), members: [] } },
    { upsert: true, new: true },
  );

  const exists = (workspace.members ?? []).some((m: any) => String(m.userId) === String((user as any)._id));
  if (!exists) {
    workspace.members.push({
      userId: (user as any)._id,
      role: body.role,
      addedAt: new Date(),
    });
  } else {
    const idx = (workspace.members ?? []).findIndex((m: any) => String(m.userId) === String((user as any)._id));
    if (idx !== -1) workspace.members[idx].role = body.role;
  }

  await workspace.save();

  const invited = await User.findById((user as any)._id).select("notificationPrefs").lean();
  const prefs = invited && !Array.isArray(invited) ? (invited as any).notificationPrefs : null;
  const inAppEnabled = prefs?.inApp?.teamInvite !== false;
  if (inAppEnabled) {
    await Notification.create({
      userId: (user as any)._id,
      kind: "team_invite",
      title: "Added to workspace",
      message: "You were added to a workspace.",
      meta: { ownerId },
      readAt: null,
    });
  }

  res.status(201).json({ member: serializeMember(user as any, body.role) });
}));

router.patch("/members/:memberId", authenticate, validate(updateRoleSchema), asyncHandler(async (req, res) => {
  const ownerId = req.userId!;
  const { memberId } = req.params;
  const body = req.body as z.infer<typeof updateRoleSchema>["body"];

  const workspace = await Workspace.findOne({ ownerId: new mongoose.Types.ObjectId(ownerId) });
  if (!workspace) throw new AppError("Workspace not found", 404);

  const idx = (workspace.members ?? []).findIndex((m: any) => String(m.userId) === String(memberId));
  if (idx === -1) throw new AppError("Member not found", 404);

  workspace.members[idx].role = body.role;
  await workspace.save();

  const user = await User.findById(memberId).select("_id name email avatar").lean();
  if (!user || Array.isArray(user)) throw new AppError("User not found", 404);

  res.json({ member: serializeMember(user as any, body.role) });
}));

router.delete("/members/:memberId", authenticate, validate(memberIdParamsSchema), asyncHandler(async (req, res) => {
  const ownerId = req.userId!;
  const { memberId } = req.params;

  const workspace = await Workspace.findOne({ ownerId: new mongoose.Types.ObjectId(ownerId) });
  if (!workspace) throw new AppError("Workspace not found", 404);

  const before = workspace.members.length;
  workspace.members = (workspace.members ?? []).filter((m: any) => String(m.userId) !== String(memberId));
  if (workspace.members.length === before) throw new AppError("Member not found", 404);

  await workspace.save();
  res.status(204).send();
}));

export { router as teamRoutes };
