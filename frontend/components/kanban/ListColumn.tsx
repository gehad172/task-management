"use client";

import { MoreHorizontal, Plus, X } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import type { ActivityDto } from "@/types/api";
import type { KanbanColumnMeta, KanbanTask } from "@/types/kanban";
import { createTask } from "@/lib/api/tasks";
import { TaskCard } from "./TaskCard";

type ListColumnProps = {
  meta: KanbanColumnMeta;
  tasks: KanbanTask[];
  boardId: string;
  onTaskOpen: (task: KanbanTask) => void;
  onTaskUpdated?: (task: KanbanTask) => void;
  onTaskDeleted?: (taskId: string) => void;
  onTaskCreated?: (task: KanbanTask, activity: ActivityDto) => void;
};

export function ListColumn({
  meta,
  tasks,
  boardId,
  onTaskOpen,
  onTaskUpdated,
  onTaskDeleted,
  onTaskCreated,
}: ListColumnProps) {
  const { setNodeRef } = useDroppable({
    id: meta.id,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = () => {
    const title = newTaskTitle.trim();

    if (!title || isCreating) {
      return;
    }

    setIsCreating(true);

    void createTask({
      title,
      boardId,
      status: meta.id,
    })
      .then(({ task, activity }) => {
        onTaskCreated?.(task, activity);
        setNewTaskTitle("");
        setIsCreateModalOpen(false);
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  return (
    <>
      <div className="flex w-80 shrink-0 flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
              {meta.title}
            </h2>
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant">
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-lg p-1.5 text-outline-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              className="rounded-lg p-1.5 text-outline-variant transition-colors hover:bg-surface-container-high"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>

        <div
          ref={setNodeRef}
          className="flex min-h-[150px] flex-col gap-3 rounded-2xl bg-surface-container-low/50 p-3 transition-colors"
        >
          <SortableContext
            items={tasks.map((task) => String(task.id))}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onTaskOpen}
                onTaskUpdated={onTaskUpdated}
                onTaskDeleted={onTaskDeleted}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/20 p-8">
              <p className="text-center text-xs font-medium text-outline">No tasks here</p>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/30 bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface dark:text-white">Create Task</h2>
              <button type="button" onClick={() => setIsCreateModalOpen(false)}>
                <X className="size-5 text-outline-variant" />
              </button>
            </div>
            <div className="space-y-5">
              <input
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Task title"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                disabled={isCreating || !newTaskTitle.trim()}
                className="flex-[2] rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
