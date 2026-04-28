import type { LucideIcon } from "lucide-react";

export type BoardStatusTone = "active" | "planning" | "completed" | "critical";

export type BoardCardData = {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  statusTone: BoardStatusTone;
  icon: LucideIcon;
  iconWrapperClassName: string;
  memberAvatars: string[];
  meta: {
    kind: "tasks" | "critical" | "schedule" | "archive";
    primary: string;
    secondary?: string;
  };
};
