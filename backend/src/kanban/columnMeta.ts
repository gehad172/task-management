export const COLUMN_ORDER = ["todo", "in_progress", "done"] as const;

export type ColumnStatus = (typeof COLUMN_ORDER)[number];

export const COLUMN_META: Record<
  ColumnStatus,
  { id: string; title: string; dotClassName: string; countTone: "neutral" | "primary" | "success" }
> = {
  todo: {
    id: "todo",
    title: "To Do",
    dotClassName: "bg-slate-400",
    countTone: "neutral",
  },
  in_progress: {
    id: "in_progress",
    title: "In Progress",
    dotClassName: "bg-primary",
    countTone: "primary",
  },
  done: {
    id: "done",
    title: "Done",
    dotClassName: "bg-emerald-500",
    countTone: "success",
  },
};

/** Accepts API values like "todo", "To Do", "in_progress", "In Progress", "done". */
export function normalizeTaskStatus(raw: unknown): ColumnStatus | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (s === "todo" || s === "to_do") return "todo";
  if (s === "in_progress" || s === "inprogress") return "in_progress";
  if (s === "done") return "done";
  return null;
}
