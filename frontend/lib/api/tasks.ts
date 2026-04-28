import type { BoardMemberDto, CreateTaskResponseDto } from "@/types/api";
import type { KanbanTask as DomainKanbanTask } from "@/types/kanban";
import { apiClient } from "@/lib/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function dateInputToIsoUtc(value: string): string | null {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

function normalizeUpdateTaskPayload(payload: UpdateTaskPayload): UpdateTaskPayload {
  if (!Object.prototype.hasOwnProperty.call(payload, "deadline")) return payload;

  const next: UpdateTaskPayload = { ...payload };
  const rawDeadline: unknown = (payload as unknown as { deadline?: unknown }).deadline;

  if (rawDeadline === undefined) return next;
  if (rawDeadline === null) {
    next.deadline = null;
    return next;
  }

  if (rawDeadline instanceof Date) {
    next.deadline = Number.isNaN(rawDeadline.getTime()) ? undefined : rawDeadline.toISOString();
    return next;
  }

  if (typeof rawDeadline === "string") {
    const trimmed = rawDeadline.trim();
    if (trimmed === "") {
      next.deadline = null;
      return next;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const iso = dateInputToIsoUtc(trimmed);
      if (iso) next.deadline = iso;
      return next;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      next.deadline = parsed.toISOString();
    }

    return next;
  }

  delete (next as unknown as { deadline?: unknown }).deadline;
  return next;
}


export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "high" | "medium" | "low";
  deadline?: string | null;
  assignedTo?: string | null;
};

type KanbanColumn = {
  meta: { id: string; title: string; dotClassName: string; countTone: string };
  tasks: DomainKanbanTask[];
};

type KanbanData = {
  board: { id: string; title: string; subtitle: string; headerAvatars: string[]; headerOverflowLabel: string };
  columns: KanbanColumn[];
  activity: unknown[];
};

export type CreateTaskPayload = {
  title: string;
  boardId: string;
  status: string;
};

export type MoveTaskPayload = {
  status: string;
  afterTaskId?: string;
};

export async function createTask(payload: CreateTaskPayload): Promise<CreateTaskResponseDto> {
  const { data } = await apiClient.post<CreateTaskResponseDto>("/api/tasks", payload);
  return data;
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload): Promise<DomainKanbanTask> {
  const normalized = normalizeUpdateTaskPayload(payload);
  const { data } = await apiClient.put<DomainKanbanTask>(`/api/tasks/${taskId}`, normalized);
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/api/tasks/${taskId}`);
}

export async function moveTask(taskId: string, payload: MoveTaskPayload): Promise<void> {
  await apiClient.patch(`/api/tasks/${taskId}/move`, payload);
}

export async function postTaskComment(taskId: string, content: string): Promise<DomainKanbanTask> {
  const { data } = await apiClient.post<DomainKanbanTask>(`/api/tasks/${taskId}/comments`, { content });
  return data;
}

export async function fetchBoardMembers(boardId: string): Promise<BoardMemberDto[]> {
  const { data } = await apiClient.get<BoardMemberDto[]>(`/api/tasks/board/${boardId}/members`);
  return data;
}

export async function fetchKanban(boardId: string): Promise<KanbanData> {
  const { data } = await apiClient.get<KanbanData>(`/api/boards/${boardId}/kanban`);
  return data;
}

export function useTasks(boardId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["kanban", boardId],
    queryFn: () => fetchKanban(boardId),
  });

  const moveMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: MoveTaskPayload }) =>
      moveTask(taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["kanban", boardId] });
      const previousData = queryClient.getQueryData<KanbanData>(["kanban", boardId]);
      if (!previousData) return;
      queryClient.setQueryData<KanbanData>(["kanban", boardId], (old) => {
        if (!old) return old;
        const newColumns = old.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }));
        const task = old.columns
          .flatMap((col) => col.tasks)
          .find((t) => t.id === taskId);
        if (!task) return old;
        const updatedTask = { ...task, status: payload.status as "todo" | "in_progress" | "done" };
        const targetColIndex = old.columns.findIndex((col) => col.meta.id === payload.status);
        if (targetColIndex === -1) return old;
        const targetCol = newColumns[targetColIndex];
        let insertIndex = 0;
        if (payload.afterTaskId) {
          const afterIndex = targetCol.tasks.findIndex((t) => t.id === payload.afterTaskId);
          if (afterIndex !== -1) insertIndex = afterIndex + 1;
        }
        targetCol.tasks.splice(insertIndex, 0, updatedTask);
        return { ...old, columns: newColumns };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["kanban", boardId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban", boardId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    moveTask: moveMutation.mutate,
    isMoving: moveMutation.isPending,
  };
}
