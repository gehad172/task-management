import { apiClient } from "@/lib/api/client";
import type { WorkspaceMemberDto, WorkspaceMemberRole } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type TeamMembersResponse = { members: WorkspaceMemberDto[] };
type TeamInviteResponse = { member: WorkspaceMemberDto };
type TeamMemberResponse = { member: WorkspaceMemberDto };

export async function fetchTeamMembers(): Promise<WorkspaceMemberDto[]> {
  const { data } = await apiClient.get<TeamMembersResponse>("/api/team/members");
  return data.members ?? [];
}

export async function inviteTeamMember(payload: {
  email: string;
  role?: WorkspaceMemberRole;
}): Promise<WorkspaceMemberDto> {
  const { data } = await apiClient.post<TeamInviteResponse>("/api/team/invite", payload);
  return data.member;
}

export async function updateTeamMemberRole(memberId: string, role: WorkspaceMemberRole): Promise<WorkspaceMemberDto> {
  const { data } = await apiClient.patch<TeamMemberResponse>(`/api/team/members/${memberId}`, { role });
  return data.member;
}

export async function removeTeamMember(memberId: string): Promise<void> {
  await apiClient.delete(`/api/team/members/${memberId}`);
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ["teamMembers"],
    queryFn: fetchTeamMembers,
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: (member) => {
      queryClient.setQueryData<WorkspaceMemberDto[]>(["teamMembers"], (prev) => {
        const list = prev ? [...prev] : [];
        const idx = list.findIndex((m) => m.id === member.id);
        if (idx === -1) return [...list, member].sort((a, b) => a.name.localeCompare(b.name));
        list[idx] = member;
        return list.sort((a, b) => a.name.localeCompare(b.name));
      });
    },
  });
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceMemberRole }) =>
      updateTeamMemberRole(memberId, role),
    onSuccess: (member) => {
      queryClient.setQueryData<WorkspaceMemberDto[]>(["teamMembers"], (prev) => {
        const list = prev ? [...prev] : [];
        const idx = list.findIndex((m) => m.id === member.id);
        if (idx === -1) return list;
        list[idx] = member;
        return list;
      });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTeamMember,
    onSuccess: (_data, memberId) => {
      queryClient.setQueryData<WorkspaceMemberDto[]>(["teamMembers"], (prev) =>
        prev ? prev.filter((m) => m.id !== memberId) : prev,
      );
    },
  });
}

