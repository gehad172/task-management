import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { Notification } from "../models/Notification.js";

const router = Router();

const listSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

const notificationIdParamsSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Invalid notification id" }),
  }),
});

function serializeNotification(doc: any) {
  return {
    id: String(doc._id),
    kind: String(doc.kind),
    title: String(doc.title),
    message: String(doc.message ?? ""),
    meta: doc.meta ?? {},
    readAt: doc.readAt ? new Date(doc.readAt).toISOString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
  };
}

router.get("/", authenticate, validate(listSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

  const docs = await Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    notifications: docs.map(serializeNotification),
  });
}));

router.patch("/:id/read", authenticate, validate(notificationIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  const doc = await Notification.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId) },
    { $set: { readAt: new Date() } },
    { new: true },
  ).lean();

  if (!doc) throw new AppError("Notification not found", 404);

  res.json({ notification: serializeNotification(doc) });
}));

export { router as notificationRoutes };

