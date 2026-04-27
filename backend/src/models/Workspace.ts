import mongoose, { Schema, type InferSchemaType } from "mongoose";

const memberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer" },
    addedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const workspaceSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true },
);

export type WorkspaceDoc = InferSchemaType<typeof workspaceSchema> & { _id: mongoose.Types.ObjectId };

export const Workspace =
  mongoose.models.Workspace ?? mongoose.model("Workspace", workspaceSchema);

