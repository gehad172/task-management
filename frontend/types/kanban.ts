import type { ReactNode } from "react";

export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "todo" | "in_progress" | "done";

export type KanbanTask = {
  id: string;
  title: string;
  description?: string;
  /** Optional UI labels used by task modal */
  project?: string;
  category?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string; // ISO date string
  assignedTo?: { id: string; name: string; avatar: string | null } | null;
  position: number;
  commentsCount?: number;
  attachmentsCount?: number;
  dueLabel?: string;
  dueDate?: string; // ISO date string
  scheduleLabel?: string;
  progress?: number;
  assigneeAvatars?: string[];
  assigneeAvatar?: string;
  completed?: boolean;
  /** Emphasize as “active” in column (tonal highlight, not a hard border). */
  highlighted?: boolean;
  tags?: string[];
  assignees?: { userId: string; name: string; avatar: string }[];
  comments?: {
    _id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    likes: number;
    createdAt: string;
  }[];
};

export type KanbanColumnMeta = {
  id: TaskStatus;
  title: string;
  dotClassName: string;
  countTone: "neutral" | "primary" | "success";
};

export type ActivityItem =
  | {
    id: string;
    kind: "user";
    avatar: string;
    body: ReactNode;
    time: string;
    showConnector?: boolean;
  }
  | {
    id: string;
    kind: "system";
    body: ReactNode;
    time: string;
  };
