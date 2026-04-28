import type { BoardStatusTone } from "@/types/dashboard";
import type { KanbanColumnMeta, KanbanTask } from "@/types/kanban";

export type BoardSummaryDto = {
  id: string;
  title: string;
  description: string;
  type: string;
  privacy: string;
  statusLabel: string;
  statusTone: BoardStatusTone;
  iconKey: "book" | "megaphone" | "mic" | "newspaper";
  memberAvatars: string[];
  meta: {
    kind: "tasks" | "critical" | "schedule" | "archive";
    primary: string;
    secondary?: string;
  };
};

export type ActivitySegmentDto = {
  type: "text" | "bold" | "primary" | "italic";
  value: string;
};

export type ActivityDto = {
  id: string;
  kind: "user" | "system";
  avatar?: string;
  time: string;
  showConnector?: boolean;
  segments: ActivitySegmentDto[];
};

export type KanbanColumnDto = {
  meta: KanbanColumnMeta;
  tasks: KanbanTask[];
};

export type KanbanBoardDto = {
  id: string;
  title: string;
  subtitle: string;
  headerAvatars: string[];
  headerOverflowLabel: string;
};

export type KanbanResponseDto = {
  board: KanbanBoardDto;
  columns: KanbanColumnDto[];
  activity: ActivityDto[];
};

export type AuthUserDto = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export type LoginResponseDto = {
  token: string;
  user: AuthUserDto;
};

export type BoardMemberDto = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export type WorkspaceMemberRole = "admin" | "editor" | "viewer";

export type WorkspaceMemberDto = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: WorkspaceMemberRole;
};

export type NotificationDto = {
  id: string;
  kind: string;
  title: string;
  message: string;
  meta: Record<string, unknown>;
  readAt: string | null;
  createdAt?: string;
};

export type NotificationPrefsDto = {
  inApp: {
    teamInvite: boolean;
    taskAssigned: boolean;
    deadline: boolean;
  };
  email: {
    teamInvite: boolean;
    taskAssigned: boolean;
    deadline: boolean;
  };
};

export type MeDto = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
  notificationPrefs: NotificationPrefsDto;
};

export type CreateTaskResponseDto = {
  task: KanbanTask;
  activity: ActivityDto;
};
