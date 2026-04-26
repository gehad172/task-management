import mongoose from "mongoose";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurifyServer = DOMPurify(window);

export function serializeBoardSummary(doc: {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: string;
  privacy: string;
  statusLabel: string;
  statusTone: string;
  iconKey: string;
  memberAvatars: string[];
  meta: { kind: string; primary: string; secondary?: string };
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    type: doc.type,
    privacy: doc.privacy,
    statusLabel: doc.statusLabel,
    statusTone: doc.statusTone,
    iconKey: doc.iconKey,
    memberAvatars: doc.memberAvatars ?? [],
    meta: doc.meta,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export function serializeTask(doc: {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: string;
  priority: string;
  position: number;
  commentsCount?: number;
  attachmentsCount?: number;
  dueLabel?: string;
  scheduleLabel?: string;
  progress?: number;
  highlighted?: boolean;
  completed?: boolean;
  assigneeAvatar?: string;
  assigneeAvatars?: string[];
  assignees?: { userId: string; name: string; avatar: string }[];
  tags?: string[];
  comments?: any[];
}) {
  const out: Record<string, unknown> = {
    id: doc._id.toString(),
    title: doc.title,
    status: doc.status,
    priority: doc.priority,
    position: doc.position,
  };
  if (doc.description != null) out.description = DOMPurifyServer.sanitize(doc.description);
  if (doc.commentsCount != null) out.commentsCount = doc.commentsCount;
  if (doc.attachmentsCount != null) out.attachmentsCount = doc.attachmentsCount;
  if (doc.dueLabel != null) out.dueLabel = doc.dueLabel;
  if (doc.scheduleLabel != null) out.scheduleLabel = doc.scheduleLabel;
  if (doc.progress != null) out.progress = doc.progress;
  if (doc.highlighted != null) out.highlighted = doc.highlighted;
  if (doc.completed != null) out.completed = doc.completed;
  if (doc.assigneeAvatar != null) out.assigneeAvatar = doc.assigneeAvatar;
  if (doc.assigneeAvatars?.length) out.assigneeAvatars = doc.assigneeAvatars;
  if (doc.assignees?.length) out.assignees = doc.assignees;
  if (doc.tags?.length) out.tags = doc.tags;
  if (doc.comments?.length) out.comments = doc.comments;
  return out;
}

export function serializeActivityEntry(a: {
  _id: mongoose.Types.ObjectId;
  kind: string;
  avatar?: string;
  time: string;
  showConnector?: boolean;
  segments?: { type: string; value: string }[];
}) {
  return {
    id: String(a._id),
    kind: a.kind,
    avatar: a.avatar,
    time: a.time,
    showConnector: a.showConnector,
    segments: a.segments ?? [],
  };
}
