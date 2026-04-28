import { apiClient } from "@/lib/api/client";
import type { MeDto, NotificationPrefsDto } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type MeResponse = { user: MeDto };

export async function fetchMe(): Promise<MeDto> {
  const { data } = await apiClient.get<MeResponse>("/api/users/me");
  return data.user;
}

export async function updateMe(payload: {
  name?: string;
  bio?: string;
  avatar?: string;
  notificationPrefs?: Partial<NotificationPrefsDto>;
}): Promise<MeDto> {
  const { data } = await apiClient.patch<MeResponse>("/api/users/me", payload);
  return data.user;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
  await apiClient.patch("/api/users/me/password", payload);
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

