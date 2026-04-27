import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, sparse: true, unique: true },
    avatar: { type: String },
    bio: { type: String, default: "" },
    notificationPrefs: {
      inApp: {
        teamInvite: { type: Boolean, default: true },
        taskAssigned: { type: Boolean, default: true },
        deadline: { type: Boolean, default: true },
      },
      email: {
        teamInvite: { type: Boolean, default: false },
        taskAssigned: { type: Boolean, default: false },
        deadline: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User =
  mongoose.models.User ?? mongoose.model("User", userSchema);
