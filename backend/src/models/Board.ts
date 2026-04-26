import mongoose, { Schema, type InferSchemaType } from "mongoose";

const metaSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["tasks", "critical", "schedule", "archive"],
      required: true,
    },
    primary: { type: String, required: true },
    secondary: { type: String },
  },
  { _id: false },
);

const boardSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, default: "Kanban Board" },
    privacy: { type: String, default: "Team Only" },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    statusLabel: { type: String, required: true },
    statusTone: {
      type: String,
      enum: ["active", "planning", "completed", "critical"],
      required: true,
    },
    iconKey: {
      type: String,
      enum: ["book", "megaphone", "mic", "newspaper"],
      required: true,
    },
    memberAvatars: { type: [String], default: [] },
    meta: { type: metaSchema, required: true },
    /** Workspace header */
    subtitle: { type: String, default: "" },
    headerAvatars: { type: [String], default: [] },
    headerOverflowLabel: { type: String, default: "+0" },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type BoardDoc = InferSchemaType<typeof boardSchema> & { _id: mongoose.Types.ObjectId };

export const Board =
  mongoose.models.Board ?? mongoose.model("Board", boardSchema);
