"use client";

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import type { ActivityDto } from "@/types/api";
import type { ActivityItem, KanbanColumnMeta, KanbanTask } from "@/types/kanban";
import { moveTask } from "@/lib/api/tasks";
import { ActivityFeed } from "@/components/kanban/ActivityFeed";
import { ListColumn } from "@/components/kanban/ListColumn";
import { TaskCard } from "@/components/kanban/TaskCard";

type KanbanColumn = {
  meta: KanbanColumnMeta;
  tasks: KanbanTask[];
};

type KanbanBoardProps = {
  boardId: string;
  columns: KanbanColumn[];
  activity: ActivityItem[];
  onTaskOpen: (task: KanbanTask) => void;
  onTaskCreated?: (task: KanbanTask, activity: ActivityDto) => void;
  onTaskMove?: (columns: KanbanColumn[]) => void;
  onRefresh?: () => void;
};

export function KanbanBoard({
  boardId,
  columns: initialColumns,
  activity,
  onTaskOpen,
  onTaskCreated,
  onTaskMove,
  onRefresh,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleTaskUpdated = (updatedTask: KanbanTask) => {
    setColumns((prev) => {
      const next = [...prev].map((column) => ({
        ...column,
        tasks: [...column.tasks],
      }));

      let existingTask: KanbanTask | undefined;
      let sourceColumnIndex = -1;
      let sourceTaskIndex = -1;

      for (let columnIndex = 0; columnIndex < next.length; columnIndex += 1) {
        const taskIndex = next[columnIndex].tasks.findIndex(
          (task) => String(task.id) === String(updatedTask.id),
        );
        if (taskIndex !== -1) {
          existingTask = next[columnIndex].tasks[taskIndex];
          sourceColumnIndex = columnIndex;
          sourceTaskIndex = taskIndex;
          break;
        }
      }

      const mergedTask = existingTask ? { ...existingTask, ...updatedTask } : updatedTask;
      const targetColumnIndex = next.findIndex((column) => column.meta.id === mergedTask.status);

      if (sourceColumnIndex !== -1 && sourceTaskIndex !== -1 && targetColumnIndex === sourceColumnIndex) {
        next[sourceColumnIndex].tasks[sourceTaskIndex] = mergedTask;
        return next;
      }

      if (sourceColumnIndex !== -1 && sourceTaskIndex !== -1) {
        next[sourceColumnIndex].tasks.splice(sourceTaskIndex, 1);
      }

      if (targetColumnIndex !== -1) {
        next[targetColumnIndex].tasks.unshift(mergedTask);
      }

      return next;
    });
  };

  const handleTaskDeleted = (taskId: string) => {
    setColumns((prev) => {
      const next = [...prev].map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => String(task.id) !== String(taskId)),
      }));

      return next;
    });
  };

  const handleTaskCreated = (task: KanbanTask, activityItem: ActivityDto) => {
    setColumns((prev) => {
      const next = [...prev].map((column) => ({
        ...column,
        tasks: [...column.tasks],
      }));

      const targetColumn = next.find((column) => column.meta.id === task.status);
      if (targetColumn) {
        targetColumn.tasks.unshift(task);
      }

      return next;
    });

    onTaskCreated?.(task, activityItem);
  };

  function handleDragStart(event: DragStartEvent) {
    const taskId = String(event.active.id);
    const task = columns.flatMap((column) => column.tasks).find((item) => String(item.id) === taskId);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) {
      return;
    }

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    let sourceColumnIndex = -1;
    let sourceTaskIndex = -1;

    for (let index = 0; index < columns.length; index += 1) {
      const taskIndex = columns[index].tasks.findIndex((task) => String(task.id) === activeTaskId);
      if (taskIndex !== -1) {
        sourceColumnIndex = index;
        sourceTaskIndex = taskIndex;
        break;
      }
    }

    if (sourceColumnIndex === -1 || sourceTaskIndex === -1) {
      return;
    }

    const overColumnIndex = columns.findIndex((column) => column.meta.id === overId);
    const overTaskColumnIndex = columns.findIndex((column) =>
      column.tasks.some((task) => String(task.id) === overId),
    );

    const targetColumnIndex = overColumnIndex !== -1 ? overColumnIndex : overTaskColumnIndex;

    if (targetColumnIndex === -1) {
      return;
    }

    const nextColumns = columns.map((column) => ({
      ...column,
      tasks: [...column.tasks],
    }));

    const [movedTask] = nextColumns[sourceColumnIndex].tasks.splice(sourceTaskIndex, 1);

    if (!movedTask) {
      return;
    }

    let insertIndex = nextColumns[targetColumnIndex].tasks.length;

    if (overColumnIndex === -1) {
      const hoveredTaskIndex = nextColumns[targetColumnIndex].tasks.findIndex(
        (task) => String(task.id) === overId,
      );

      if (hoveredTaskIndex !== -1) {
        insertIndex = hoveredTaskIndex + 1;
      }
    }

    if (sourceColumnIndex === targetColumnIndex && sourceTaskIndex < insertIndex) {
      insertIndex -= 1;
    }

    const updatedTask = {
      ...movedTask,
      status: nextColumns[targetColumnIndex].meta.id,
    };

    nextColumns[targetColumnIndex].tasks.splice(insertIndex, 0, updatedTask);

    const normalizedColumns = nextColumns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task, index) => ({
        ...task,
        position: index,
      })),
    }));

    setColumns(normalizedColumns);
    onTaskMove?.(normalizedColumns);

    const afterTaskId =
      overColumnIndex !== -1
        ? normalizedColumns[targetColumnIndex].tasks[normalizedColumns[targetColumnIndex].tasks.length - 2]?.id
        : overId;

    void moveTask(activeTaskId, {
      status: normalizedColumns[targetColumnIndex].meta.id,
      afterTaskId,
    }).catch(() => {
      onRefresh?.();
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-[calc(100vh-200px)] items-start gap-6 overflow-x-auto pb-8">
        {columns.map((column) => (
          <ListColumn
            key={column.meta.id}
            meta={column.meta}
            tasks={column.tasks}
            boardId={boardId}
            onTaskOpen={onTaskOpen}
            onTaskCreated={handleTaskCreated}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
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
