"use client";

import type { ChangeEvent, MouseEvent } from "react";
import { useState } from "react";
import { CalendarDays, Edit, MessageCircle, MoreHorizontal, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteTask, updateTask } from "@/lib/api/tasks";
import type { KanbanTask } from "@/types/kanban";

function PriorityPill({ priority }: { priority: KanbanTask["priority"] }) {
  const map: Record<KanbanTask["priority"], string> = {
    high: "bg-red-500/20 text-red-300",
    medium: "bg-yellow-500/20 text-yellow-200",
    low: "bg-green-500/20 text-green-300",
  };

  const label =
    priority === "high" ? "High Priority" : priority === "medium" ? "Medium" : "Low";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[priority]}`}
    >
      {label}
    </span>
  );
}

type TaskCardProps = {
  task: KanbanTask;
  onOpen: (task: KanbanTask) => void;
  onTaskUpdated?: (task: KanbanTask) => void;
  onTaskDeleted?: (taskId: string) => void;
  isDragging?: boolean;
};

const priorityValues: KanbanTask["priority"][] = ["low", "medium", "high"];

function isTaskPriority(value: string): value is KanbanTask["priority"] {
  return priorityValues.includes(value as KanbanTask["priority"]);
}

export function TaskCard({
  task,
  onOpen,
  onTaskUpdated,
  onTaskDeleted,
  isDragging,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isLocalDragging,
  } = useSortable({
    id: String(task.id),
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState<KanbanTask["priority"]>(task.priority);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isLocalDragging || isDragging ? 0.5 : 1,
  };

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (isTaskPriority(value)) {
      setEditPriority(value);
    }
  };

  const handleUpdate = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const title = editTitle.trim();

    if (!title || isSaving) {
      return;
    }

    setIsSaving(true);

    void updateTask(String(task.id), {
      title,
      description: editDesc.trim() || undefined,
      priority: editPriority,
    })
      .then((updatedTask) => {
        onTaskUpdated?.(updatedTask);
        setMenuOpen(false);
        setIsEditModalOpen(false);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDeleting) {
      return;
    }

    setMenuOpen(false);
    setIsDeleting(true);

    void deleteTask(String(task.id))
      .then(() => {
        onTaskDeleted?.(String(task.id));
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const isDone = task.status === "done" || task.completed;
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = Boolean(deadlineDate && !isDone && deadlineDate.getTime() < Date.now());
  const deadlineLabel = deadlineDate
    ? deadlineDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => onOpen(task)}
        {...attributes}
        {...listeners}
        className={`group rounded-xl bg-surface-container-lowest p-6 text-left transition-all dark:bg-slate-900/80 ${isDone ? "cursor-default opacity-80" : "cursor-grab shadow-sm hover:shadow-lg active:cursor-grabbing"}`}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <PriorityPill priority={task.priority} />
          {!isDone && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="rounded-lg p-1 text-outline-variant opacity-0 transition-opacity hover:bg-surface-container-high hover:text-primary group-hover:opacity-100"
            >
              <MoreHorizontal className="size-5" />
            </button>
          )}
        </div>
        <h3
          className={`mb-2 font-headline font-bold leading-snug text-on-surface dark:text-slate-100 ${isDone ? "line-through opacity-50" : ""}`}
        >
          {task.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-on-surface-variant">
            {deadlineLabel ? (
              <span className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? "text-error" : ""}`}>
                <CalendarDays className="size-3.5" />
                {deadlineLabel}
              </span>
            ) : null}
            <span className="flex items-center gap-1 text-[10px] font-bold">
              <MessageCircle className="size-3.5" /> {task.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute right-2 top-12 z-20 w-32 rounded-lg border border-outline-variant bg-surface-container-high p-1 shadow-xl dark:bg-slate-800">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setMenuOpen(false);
              setIsEditModalOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-surface-container-highest dark:hover:bg-slate-700"
          >
            <Edit className="size-4" /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-error hover:bg-error/10 disabled:opacity-50"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/30 bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface dark:text-white">Edit Task</h2>
              <button type="button" onClick={() => setIsEditModalOpen(false)}>
                <X className="size-5 text-outline-variant" />
              </button>
            </div>
            <div className="space-y-5">
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm dark:bg-slate-800 dark:text-white"
              />
              <textarea
                value={editDesc}
                onChange={(event) => setEditDesc(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm dark:bg-slate-800 dark:text-white"
              />
              <select
                value={editPriority}
                onChange={handlePriorityChange}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm dark:bg-slate-800 dark:text-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSaving}
                className="flex-[2] rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
