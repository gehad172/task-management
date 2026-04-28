import type { BoardSummaryDto, KanbanResponseDto } from "@/types/api";
import { apiClient } from "@/lib/api/client";

export type CreateBoardPayload = {
  title: string;
  description?: string;
  type?: string;
  privacy?: string;
};

export async function createBoard(payload: CreateBoardPayload): Promise<BoardSummaryDto> {
  const { data } = await apiClient.post<BoardSummaryDto>("/api/boards", payload);
  return data;
}

export async function fetchBoardSummaries(): Promise<BoardSummaryDto[]> {
  const { data } = await apiClient.get<BoardSummaryDto[]>("/api/boards");
  return data;
}

export async function fetchBoardKanban(boardId: string): Promise<KanbanResponseDto> {
  const { data } = await apiClient.get<KanbanResponseDto>(`/api/boards/${boardId}/kanban`);
  return data;
}

export async function updateBoard(boardId: string, payload: UpdateBoardPayload): Promise<BoardSummaryDto> {
  const { data } = await apiClient.put<BoardSummaryDto>(`/api/boards/${boardId}`, payload);
  return data;
}

export async function archiveBoard(boardId: string): Promise<void> {
  await apiClient.patch(`/api/boards/${boardId}`);
}

export async function deleteBoard(boardId: string): Promise<void> {
  await apiClient.delete(`/api/boards/${boardId}`);
}

export type UpdateBoardPayload = {
  title?: string;
  description?: string;
};
