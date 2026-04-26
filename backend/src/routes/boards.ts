import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { COLUMN_META, COLUMN_ORDER, type ColumnStatus } from "../kanban/columnMeta.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../utils/AppError.js";
import { ActivityEntry } from "../models/ActivityEntry.js";
import { Board } from "../models/Board.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { serializeActivityEntry, serializeBoardSummary, serializeTask } from "../utils/serialize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const JUST_NOW = "Just now";

const createBoardSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional().default(""),
    type: z.string().trim().optional().default("Kanban Board"),
    privacy: z.string().trim().optional().default("Team Only"),
  }),
});

const updateBoardSchema = z.object({
  params: z.object({
    boardId: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Invalid board id" }),
  }),
  body: z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
  }).refine((data) => data.title !== undefined || data.description !== undefined, {
    message: "At least title or description must be provided",
  }),
});

const boardIdParamsSchema = z.object({
  params: z.object({
    boardId: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Invalid board id" }),
  }),
});

const kanbanQuerySchema = z.object({
  params: z.object({
    boardId: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Invalid board id" }),
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).optional(),
    offset: z.string().regex(/^\d+$/).optional(),
  }),
});

router.post("/", authenticate, validate(createBoardSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const body = req.body as z.infer<typeof createBoardSchema>["body"];

  const { title, description, type, privacy } = body;

  const doc = await Board.create({
    title,
    description,
    type,
    privacy,
    owner: new mongoose.Types.ObjectId(userId),
    statusLabel: "Active",
    statusTone: "active",
    iconKey: "book",
    memberAvatars: [],
    meta: { kind: "tasks", primary: "0/0" },
    subtitle: description || "",
    headerAvatars: [],
    headerOverflowLabel: "+0",
  });

  const userLean = await User.findById(userId).lean();
  const user = userLean && !Array.isArray(userLean) ? userLean : null;
  const actorName = user?.name ? String(user.name) : "User";

  await ActivityEntry.create({
    boardId: doc._id,
    kind: "user",
    avatar: user?.avatar ? String(user.avatar) : undefined,
    time: JUST_NOW,
    showConnector: false,
    segments: [
      { type: "bold", value: actorName },
      { type: "text", value: " created board " },
      { type: "primary", value: title },
    ],
  });

  const created = await Board.findById(doc._id).lean();
  if (!created || Array.isArray(created)) {
    throw new AppError("Failed to load created board", 500);
  }

  res.status(201).json(
    serializeBoardSummary({
      _id: created._id as mongoose.Types.ObjectId,
      title: String(created.title),
      description: String(created.description ?? ""),
      type: String(created.type ?? ""),
      privacy: String(created.privacy ?? ""),
      statusLabel: String(created.statusLabel),
      statusTone: String(created.statusTone),
      iconKey: String(created.iconKey),
      memberAvatars: (created.memberAvatars as string[]) ?? [],
      meta: created.meta as { kind: string; primary: string; secondary?: string },
    }),
  );
}));

router.get("/", authenticate, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const docs = await Board.find({ owner: new mongoose.Types.ObjectId(userId), archived: false })
    .sort({ createdAt: 1 })
    .lean();
  res.json(
    docs.map((d) =>
      serializeBoardSummary({
        _id: d._id as mongoose.Types.ObjectId,
        title: String(d.title),
        description: String(d.description ?? ""),
        type: String(d.type ?? ""),
        privacy: String(d.privacy ?? ""),
        statusLabel: String(d.statusLabel),
        statusTone: String(d.statusTone),
        iconKey: String(d.iconKey),
        memberAvatars: (d.memberAvatars as string[]) ?? [],
        meta: d.meta as { kind: string; primary: string; secondary?: string },
      }),
    ),
  );
}));

router.put("/:boardId", authenticate, validate(updateBoardSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { boardId } = req.params;
  const body = req.body as z.infer<typeof updateBoardSchema>["body"];

  const board = await Board.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(boardId),
      owner: new mongoose.Types.ObjectId(userId),
    },
    { $set: body },
    { new: true },
  ).lean();

  if (!board || Array.isArray(board)) {
    throw new AppError("Board not found", 404);
  }
  res.json(
    serializeBoardSummary({
      _id: board._id as mongoose.Types.ObjectId,
      title: String(board.title),
      description: String(board.description ?? ""),
      type: String(board.type ?? ""),
      privacy: String(board.privacy ?? ""),
      statusLabel: String(board.statusLabel),
      statusTone: String(board.statusTone),
      iconKey: String(board.iconKey),
      memberAvatars: (board.memberAvatars as string[]) ?? [],
      meta: board.meta as { kind: string; primary: string; secondary?: string },
    }),
  );
}));

router.get("/:boardId/kanban", authenticate, validate(kanbanQuerySchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { boardId } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 1000, 1000);
  const offset = parseInt(req.query.offset as string) || 0;

  const board = await Board.findOne({
    _id: new mongoose.Types.ObjectId(boardId),
    owner: new mongoose.Types.ObjectId(userId),
    archived: false,
  }).lean();

  if (!board || Array.isArray(board)) {
    throw new AppError("Board not found", 404);
  }

  const boardOid = board._id as mongoose.Types.ObjectId;

  const taskDocs = await Task.find({ boardId: boardOid, isArchived: false })
    .select("title description status priority position commentsCount attachmentsCount dueLabel scheduleLabel progress highlighted completed assigneeAvatar assigneeAvatars")
    .sort({ position: 1 })
    .skip(offset)
    .limit(limit)
    .lean();
  const activityDocs = await ActivityEntry.find({ boardId: boardOid })
    .sort({ createdAt: -1 })
    .lean();

  const grouped: Record<ColumnStatus, typeof taskDocs> = {
    todo: [],
    in_progress: [],
    done: [],
  };
  for (const t of taskDocs) {
    const s = String(t.status) as ColumnStatus;
    if (grouped[s]) grouped[s].push(t);
  }

  const columns = COLUMN_ORDER.map((status) => ({
    meta: COLUMN_META[status],
    tasks: grouped[status].map((t) =>
      serializeTask({
        _id: t._id as mongoose.Types.ObjectId,
        title: String(t.title),
        description: t.description ? String(t.description) : undefined,
        status: String(t.status),
        priority: String(t.priority),
        position: typeof t.position === "number" ? t.position : 0,
        commentsCount: t.commentsCount ?? undefined,
        attachmentsCount: t.attachmentsCount ?? undefined,
        dueLabel: t.dueLabel ? String(t.dueLabel) : undefined,
        scheduleLabel: t.scheduleLabel ? String(t.scheduleLabel) : undefined,
        progress: typeof t.progress === "number" ? t.progress : undefined,
        highlighted: Boolean(t.highlighted),
        completed: Boolean(t.completed),
        assigneeAvatar: t.assigneeAvatar ? String(t.assigneeAvatar) : undefined,
        assigneeAvatars: (t.assigneeAvatars as string[] | undefined) ?? undefined,
      }),
    ),
  }));

  const activity = activityDocs.map((a) =>
    serializeActivityEntry({
      _id: a._id as mongoose.Types.ObjectId,
      kind: String(a.kind),
      avatar: a.avatar,
      time: String(a.time),
      showConnector: Boolean(a.showConnector),
      segments: (a.segments as { type: string; value: string }[]) ?? [],
    }),
  );

  res.json({
    board: {
      id: boardOid.toString(),
      title: String(board.title),
      subtitle: String(board.subtitle ?? ""),
      headerAvatars: (board.headerAvatars as string[]) ?? [],
      headerOverflowLabel: String(board.headerOverflowLabel ?? "+0"),
    },
    columns,
    activity,
  });
}));

router.patch("/:boardId", authenticate, validate(boardIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { boardId } = req.params;

  const board = await Board.findOne({
    _id: new mongoose.Types.ObjectId(boardId),
    owner: new mongoose.Types.ObjectId(userId),
  });
  if (!board) {
    throw new AppError("Board not found", 404);
  }
  board.archived = !board.archived;
  await board.save();
  res.json({ message: board.archived ? "Board archived" : "Board unarchived" });
}));

router.delete("/:boardId", authenticate, validate(boardIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { boardId } = req.params;

  const board = await Board.findOne({
    _id: new mongoose.Types.ObjectId(boardId),
    owner: new mongoose.Types.ObjectId(userId),
  });
  if (!board) {
    throw new AppError("Board not found", 404);
  }
  await Task.deleteMany({ boardId: board._id });
  await ActivityEntry.deleteMany({ boardId: board._id });
  await Board.findByIdAndDelete(boardId);
  res.json({ message: "Board deleted" });
}));

export { router as boardRoutes };
