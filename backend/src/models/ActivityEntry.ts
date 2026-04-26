import mongoose, { Schema, type InferSchemaType } from "mongoose";

const segmentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "bold", "primary", "italic"],
      required: true,
    },
    value: { type: String, required: true },
  },
  { _id: false },
);

const activityEntrySchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    kind: { type: String, enum: ["user", "system"], required: true },
    avatar: { type: String },
    time: { type: String, required: true },
    showConnector: { type: Boolean, default: false },
    segments: { type: [segmentSchema], default: [] },
  },
  { timestamps: true },
);

export type ActivityEntryDoc = InferSchemaType<typeof activityEntrySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ActivityEntry =
  mongoose.models.ActivityEntry ??
  mongoose.model("ActivityEntry", activityEntrySchema);
