import mongoose, { Schema, type InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
    },
    deadline: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
    position: { type: Number, required: true, default: 0, index: true },
    commentsCount: { type: Number },
    attachmentsCount: { type: Number },
    dueLabel: { type: String },
    scheduleLabel: { type: String },
    progress: { type: Number, min: 0, max: 1 },
    highlighted: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    assigneeAvatar: { type: String },
    assigneeAvatars: { type: [String], default: [] },
    assignees: [
      {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String, required: true },
      }
    ],
    tags: { type: [String], default: [] },
    comments: [
      {
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
        authorAvatar: { type: String },
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

taskSchema.index({ boardId: 1, status: 1, position: 1 });

export type TaskDoc = InferSchemaType<typeof taskSchema> & { _id: mongoose.Types.ObjectId };

export const Task =
  mongoose.models.Task ?? mongoose.model("Task", taskSchema);
