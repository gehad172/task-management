import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import validator from "validator";
import DOMPurify from "isomorphic-dompurify";
import { COLUMN_META, normalizeTaskStatus, type ColumnStatus } from "../kanban/columnMeta.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../utils/AppError.js";
import { ActivityEntry } from "../models/ActivityEntry.js";
import { Board } from "../models/Board.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { serializeActivityEntry, serializeTask } from "../utils/serialize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const JUST_NOW = "Just now";

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").transform(val => validator.escape(val)),
    boardId: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Valid boardId is required" }),
    status: z.enum(["todo", "in_progress", "done"], { message: "Invalid status" }),
  }),
});

const moveTaskSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Valid Task ID is required" }),
  }),
  body: z.object({
    status: z.enum(["todo", "in_progress", "done"], { message: "Invalid status" }),
    afterTaskId: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Invalid afterTaskId" }).optional(),
  }),
});

const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Valid Task ID is required" }),
  }),
  body: z.object({
    title: z.string().trim().min(1).transform(val => validator.escape(val)).optional(),
    description: z.string().trim().transform(val => DOMPurify.sanitize(val)).optional(),
    priority: z.enum(["high", "medium", "low"]).optional(),
    status: z
      .union([z.enum(["todo", "in_progress", "done"]), z.literal("Done")])
      .transform((value) => (value === "Done" ? "done" : value))
      .optional(),
    deadline: z.string().datetime().nullable().optional(),
    assignedTo: z
      .string()
      .refine((val) => mongoose.isValidObjectId(val), { message: "Valid assignedTo is required" })
      .nullable()
      .optional(),
    tags: z.array(z.string()).optional(),
    assignees: z.array(z.object({
      userId: z.string(),
      name: z.string(),
      avatar: z.string()
    })).optional()
  }).refine((data) => data.title !== undefined || data.description !== undefined || data.priority !== undefined || data.status !== undefined || data.deadline !== undefined || data.assignedTo !== undefined || data.tags !== undefined || data.assignees !== undefined, {
    message: "At least one field to update must be provided"
  }),
});

const boardMembersSchema = z.object({
  params: z.object({
    boardId: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Valid boardId is required" }),
  }),
});

const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Valid Task ID is required" }),
  }),
});

function serializeTaskDoc(task: any) {
  const assignedToDoc = task.assignedTo && typeof task.assignedTo === "object" && "_id" in task.assignedTo
    ? task.assignedTo
    : null;

  return serializeTask({
    _id: task._id as mongoose.Types.ObjectId,
    title: String(task.title),
    description: task.description ? String(task.description) : undefined,
    status: String(task.status),
    priority: String(task.priority),
    deadline: task.deadline instanceof Date ? task.deadline : undefined,
    assignedTo: assignedToDoc
      ? {
          _id: assignedToDoc._id as mongoose.Types.ObjectId,
          name: assignedToDoc.name ? String(assignedToDoc.name) : undefined,
          avatar: assignedToDoc.avatar ? String(assignedToDoc.avatar) : undefined,
        }
      : undefined,
    position: task.position,
    commentsCount: task.commentsCount ?? undefined,
    attachmentsCount: task.attachmentsCount ?? undefined,
    dueLabel: task.dueLabel ? String(task.dueLabel) : undefined,
    scheduleLabel: task.scheduleLabel ? String(task.scheduleLabel) : undefined,
    progress: typeof task.progress === "number" ? task.progress : undefined,
    highlighted: Boolean(task.highlighted),
    completed: Boolean(task.completed),
    assigneeAvatar: task.assigneeAvatar ? String(task.assigneeAvatar) : undefined,
    assigneeAvatars: (task.assigneeAvatars as string[] | undefined) ?? undefined,
    assignees: task.assignees as any,
    tags: task.tags as any,
    comments: task.comments as any,
  });
}

router.post("/", authenticate, validate(createTaskSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const body = req.body as z.infer<typeof createTaskSchema>["body"];
  const { title, boardId, status } = body;

  const board = await Board.findOne({
    _id: new mongoose.Types.ObjectId(boardId),
    owner: new mongoose.Types.ObjectId(userId),
  });

  if (!board) {
    throw new AppError("Board not found", 404);
  }

  const normalizedStatus = normalizeTaskStatus(status) as ColumnStatus;

  const maxPosition = await Task.findOne({ boardId: board._id, status: normalizedStatus }).sort({ position: -1 });
  const position = maxPosition ? maxPosition.position + 1 : 0;

  const taskDoc = await Task.create({
    boardId: board._id,
    title,
    status: normalizedStatus,
    position,
    priority: "medium",
  });

  const userLean = await User.findById(userId).lean();
  const user = userLean && !Array.isArray(userLean) ? userLean : null;
  const actorName = user?.name ? String(user.name) : "User";
  const columnTitle = COLUMN_META[normalizedStatus].title;

  const activityDoc = await ActivityEntry.create({
    boardId: board._id,
    kind: "user",
    avatar: user?.avatar ? String(user.avatar) : undefined,
    time: JUST_NOW,
    showConnector: false,
    segments: [
      { type: "bold", value: actorName },
      { type: "text", value: " added " },
      { type: "primary", value: title },
      { type: "text", value: " to " },
      { type: "bold", value: columnTitle },
    ],
  });

  const taskLean = await Task.findById(taskDoc._id).populate("assignedTo", "name avatar").lean();
  const actLean = await ActivityEntry.findById(activityDoc._id).lean();
  if (!taskLean || Array.isArray(taskLean) || !actLean || Array.isArray(actLean)) {
    throw new AppError("Failed to load created task", 500);
  }

  res.status(201).json({
    task: serializeTaskDoc(taskLean),
    activity: serializeActivityEntry({
      _id: actLean._id as mongoose.Types.ObjectId,
      kind: String(actLean.kind),
      avatar: actLean.avatar,
      time: String(actLean.time),
      showConnector: Boolean(actLean.showConnector),
      segments: (actLean.segments as { type: string; value: string }[]) ?? [],
    }),
  });
}));

router.patch("/:id/move", authenticate, validate(moveTaskSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body as z.infer<typeof moveTaskSchema>["body"];
  const userId = req.userId!;

  const task = await Task.findById(id).populate("boardId").populate("assignedTo", "name avatar");
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const board = task.boardId as any;
  if (board.owner.toString() !== userId) {
    throw new AppError("Forbidden", 403);
  }

  let newPosition: number;
  if (body.afterTaskId) {
    const afterTask = await Task.findOne({ _id: body.afterTaskId, boardId: board._id, status: body.status });
    if (!afterTask) {
      throw new AppError("After task not found in target status", 400);
    }
    const nextTask = await Task.findOne({ boardId: board._id, status: body.status, position: { $gt: afterTask.position } }).sort({ position: 1 });
    newPosition = nextTask ? (afterTask.position + nextTask.position) / 2 : afterTask.position + 1;
  } else {
    const maxTask = await Task.findOne({ boardId: board._id, status: body.status }).sort({ position: -1 });
    newPosition = maxTask ? maxTask.position + 1 : 0;
  }

  task.status = body.status;
  task.position = newPosition;
  await task.save();

  res.json(serializeTaskDoc(task));
}));

router.put("/:id", authenticate, validate(updateTaskSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body as z.infer<typeof updateTaskSchema>["body"];
  const userId = req.userId!;

  const task = await Task.findById(id).populate("boardId").populate("assignedTo", "name avatar");
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const board = task.boardId as any;
  if (board.owner.toString() !== userId) {
    throw new AppError("Forbidden", 403);
  }

  if (body.title !== undefined) task.title = body.title;
  if (body.description !== undefined) task.description = body.description;
  if (body.priority !== undefined) task.priority = body.priority;
  if (body.status !== undefined) {
    task.status = body.status;
    task.completed = body.status === "done";
  }
  if (body.deadline !== undefined) {
    task.deadline = body.deadline ? new Date(body.deadline) : undefined;
  }
  if (body.assignedTo !== undefined) {
    if (body.assignedTo === null) {
      task.assignedTo = undefined;
    } else {
      const assignedUser = await User.findById(body.assignedTo).select("_id");
      if (!assignedUser) {
        throw new AppError("Assigned user not found", 404);
      }
      task.assignedTo = assignedUser._id;
    }
  }
  if (body.tags !== undefined) task.tags = body.tags;
  if (body.assignees !== undefined) task.assignees = body.assignees;
  await task.save();
  await task.populate("assignedTo", "name avatar");

  res.json(serializeTaskDoc(task));
}));

router.delete("/:id", authenticate, validate(deleteTaskSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId!;

  const task = await Task.findById(id).populate("boardId");
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const board = task.boardId as any;
  if (board.owner.toString() !== userId) {
    throw new AppError("Forbidden", 403);
  }

  await Task.findByIdAndDelete(id);
  res.json({ message: "Task deleted" });
}));

const postCommentSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.isValidObjectId(val), { message: "Valid Task ID is required" }),
  }),
  body: z.object({
    content: z.string().trim().min(1, "Comment content cannot be empty").transform(val => validator.escape(val)),
  }),
});

router.post("/:id/comments", authenticate, validate(postCommentSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body as z.infer<typeof postCommentSchema>["body"];
  const userId = req.userId!;

  const task = await Task.findById(id).populate("boardId").populate("assignedTo", "name avatar");
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const board = task.boardId as any;
  if (board.owner.toString() !== userId) {
    throw new AppError("Forbidden", 403);
  }

  const user = await User.findById(userId);

  task.comments.push({
    authorId: userId,
    authorName: user?.name ? String(user.name) : "User",
    authorAvatar: user?.avatar ? String(user.avatar) : undefined,
    content: body.content,
  });

  task.commentsCount = task.comments.length;
  await task.save();

  res.status(201).json(serializeTaskDoc(task));
}));

router.get("/board/:boardId/members", authenticate, validate(boardMembersSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { boardId } = req.params;

  const board = await Board.findOne({
    _id: new mongoose.Types.ObjectId(boardId),
    owner: new mongoose.Types.ObjectId(userId),
    archived: false,
  }).select("_id");
  if (!board) {
    throw new AppError("Board not found", 404);
  }

  const members = await User.find({})
    .select("_id name avatar email")
    .sort({ name: 1 })
    .limit(50)
    .lean();

  res.json(
    members.map((m) => ({
      id: String(m._id),
      name: String(m.name ?? "User"),
      avatar: m.avatar ? String(m.avatar) : null,
      email: m.email ? String(m.email) : "",
    })),
  );
}));

export { router as taskRoutes };
