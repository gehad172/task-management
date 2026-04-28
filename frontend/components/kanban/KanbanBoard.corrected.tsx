"use client";

import {
  DragOverlay,
  DndContext,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { useState } from "react";
import type { ActivityDto } from "@/types/api";
import type { ActivityItem, KanbanColumnMeta, KanbanTask } from "@/types/kanban";
import { ActivityFeed } from "@/components/kanban/ActivityFeed";
import { ListColumn } from "@/components/kanban/ListColumn";
import { TaskCard } from "@/components/kanban/TaskCard";

type KanbanBoardProps = {
  boardId: string;
  columns: { meta: KanbanColumnMeta; tasks: KanbanTask[] }[];
  activity: ActivityItem[];
  onTaskOpen: (task: KanbanTask) => void;
  onTaskCreated?: (task: KanbanTask, activity: ActivityDto) => void;
  onTaskMove?: (taskId: string, status: string, afterTaskId?: string) => void;
};

export function KanbanBoard({
  boardId,
  columns,
  activity,
  onTaskOpen,
  onTaskCreated,
  onTaskMove,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const taskId = String(active.id);
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => String(t.id) === taskId);
    setActiveTask(task || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const taskId = String(active.id);
    const overId = String(over.id);
    const activeColumn = columns.find((col) =>
      col.tasks.some((t) => String(t.id) === taskId)
    );
    if (!activeColumn) return;
    const isOverColumn = columns.some((col) => col.meta.id === overId);
    if (isOverColumn) {
      const targetStatus = overId;
      if (targetStatus === activeColumn.meta.id) return;
      onTaskMove?.(taskId, targetStatus);
    } else {
      const targetColumn = columns.find((col) =>
        col.tasks.some((t) => String(t.id) === overId)
      );
      if (!targetColumn) return;
      const targetStatus = targetColumn.meta.id;
      const afterTaskId = overId;
      onTaskMove?.(taskId, targetStatus, afterTaskId);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-[calc(100vh-200px)] items-start gap-6 overflow-x-auto pb-8">
        {columns.map((col) => (
          <ListColumn
            key={col.meta.id}
            meta={col.meta}
            tasks={col.tasks}
            boardId={boardId}
            onTaskOpen={onTaskOpen}
            onTaskCreated={onTaskCreated}
          />
        ))}
        <ActivityFeed items={activity} />
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-50">
            <TaskCard task={activeTask} onOpen={() => {}} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
