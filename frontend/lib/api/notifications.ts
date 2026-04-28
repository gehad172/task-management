import { apiClient } from "@/lib/api/client";
import type { NotificationDto } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ListResponse = { notifications: NotificationDto[] };
type OneResponse = { notification: NotificationDto };

export async function fetchNotifications(limit = 20): Promise<NotificationDto[]> {
  const { data } = await apiClient.get<ListResponse>("/api/notifications", { params: { limit } });
  return data.notifications ?? [];
}

export async function markNotificationRead(id: string): Promise<NotificationDto> {
  const { data } = await apiClient.patch<OneResponse>(`/api/notifications/${id}/read`);
  return data.notification;
}

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => fetchNotifications(limit),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead(limit = 20) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<NotificationDto[]>(["notifications", limit], (prev) => {
        if (!prev) return prev;
        return prev.map((n) => (n.id === updated.id ? updated : n));
      });
    },
  });
}

