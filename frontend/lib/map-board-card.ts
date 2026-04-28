import { BookOpen, Megaphone, Mic, Newspaper } from "lucide-react";
import type { BoardSummaryDto } from "@/types/api";
import type { BoardCardData } from "@/types/dashboard";

const ICON_MAP = {
  book: BookOpen,
  megaphone: Megaphone,
  mic: Mic,
  newspaper: Newspaper,
} as const;

const WRAPPER_MAP: Record<BoardSummaryDto["iconKey"], string> = {
  book: "bg-tertiary-container text-on-tertiary-container",
  megaphone: "bg-indigo-50 text-primary dark:bg-indigo-950/50 dark:text-indigo-300",
  mic: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
  newspaper: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export function mapBoardSummaryToCard(dto: BoardSummaryDto): BoardCardData {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    statusLabel: dto.statusLabel,
    statusTone: dto.statusTone,
    icon: ICON_MAP[dto.iconKey],
    iconWrapperClassName: WRAPPER_MAP[dto.iconKey],
    memberAvatars: dto.memberAvatars,
    meta: dto.meta,
  };
}
