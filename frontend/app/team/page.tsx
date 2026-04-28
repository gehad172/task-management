"use client";

import Image from "next/image";
import { MoreVertical, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { InviteMemberModal } from "@/components/modals/InviteMemberModal";
import { useInviteTeamMember, useRemoveTeamMember, useTeamMembers, useUpdateTeamMemberRole } from "@/lib/api/team";
import type { WorkspaceMemberDto, WorkspaceMemberRole } from "@/types/api";

const EMPTY_MEMBERS: WorkspaceMemberDto[] = [];

const ROLE_LABEL: Record<WorkspaceMemberRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

function roleBadgeClass(role: WorkspaceMemberRole) {
  switch (role) {
    case "admin":
      return "bg-primary/10 text-primary ring-primary/20 dark:text-indigo-300";
    case "editor":
      return "bg-secondary-container/60 text-on-secondary-container ring-outline-variant/30 dark:bg-slate-800/60 dark:text-slate-200";
    case "viewer":
      return "bg-surface-container-highest/70 text-on-surface ring-outline-variant/30 dark:bg-slate-800/40 dark:text-slate-300";
  }
}

export default function TeamPage() {
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const membersQuery = useTeamMembers();
  const inviteMutation = useInviteTeamMember();
  const updateRoleMutation = useUpdateTeamMemberRole();
  const removeMutation = useRemoveTeamMember();

  const members = membersQuery.data ?? EMPTY_MEMBERS;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, query]);

  const counts = useMemo(() => {
    return {
      total: members.length,
      admins: members.filter((m) => m.role === "admin").length,
      editors: members.filter((m) => m.role === "editor").length,
      viewers: members.filter((m) => m.role === "viewer").length,
    };
  }, [members]);

  async function handleInvite(payload: { email: string; role: WorkspaceMemberRole }) {
    setInviteError(null);
    try {
      await inviteMutation.mutateAsync(payload);
      setInviteOpen(false);
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : "Failed to invite member");
    }
  }

  async function handleRoleChange(member: WorkspaceMemberDto, role: WorkspaceMemberRole) {
    if (updateRoleMutation.isPending) return;
    await updateRoleMutation.mutateAsync({ memberId: member.id, role });
    setMenuFor(null);
  }

  async function handleRemove(member: WorkspaceMemberDto) {
    if (removeMutation.isPending) return;
    await removeMutation.mutateAsync(member.id);
    setMenuFor(null);
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface dark:bg-background-dark dark:text-slate-100">
      <AppHeader />
      <AppSidebar />

      <main className="min-h-screen px-6 pb-24 pt-24 md:ml-64 md:px-8 md:pb-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <nav className="mb-2 flex space-x-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-primary dark:text-indigo-300">Team</span>
              </nav>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface dark:text-white">
                Collaborators
              </h1>
              <p className="mt-1 text-on-surface-variant dark:text-slate-400">Invite teammates and manage roles.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" strokeWidth={1.75} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter members..."
                  className="w-full rounded-lg border-none bg-surface-container-high py-2.5 pl-10 pr-4 text-sm text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setInviteError(null);
                  setInviteOpen(true);
                }}
                className="jewel-button inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-on-primary shadow-md shadow-primary/20 transition-opacity hover:opacity-90"
              >
                <UserPlus className="size-4" strokeWidth={1.75} />
                Invite Member
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-surface-container-low p-6 dark:bg-slate-900/50">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-extrabold text-primary dark:text-indigo-300">{counts.total}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-6 dark:bg-slate-900/50">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">Admins</p>
              <p className="mt-1 text-2xl font-extrabold text-primary dark:text-indigo-300">{counts.admins}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-6 dark:bg-slate-900/50">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">Editors</p>
              <p className="mt-1 text-2xl font-extrabold text-primary dark:text-indigo-300">{counts.editors}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-6 dark:bg-slate-900/50">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">Viewers</p>
              <p className="mt-1 text-2xl font-extrabold text-primary dark:text-indigo-300">{counts.viewers}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest dark:border-slate-700/40 dark:bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-surface-container-low/70 dark:bg-slate-900/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                      Member
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                      Role
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 dark:divide-slate-700/40">
                  {membersQuery.isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm text-on-surface-variant dark:text-slate-400">
                        Loading members...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm text-on-surface-variant dark:text-slate-400">
                        No members found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((member) => (
                      <tr key={member.id} className="hover:bg-surface-container-low/60 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/10">
                              <Image
                                src={member.avatar ?? "/default-avatar.png"}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="font-bold text-on-surface dark:text-slate-100">{member.name}</p>
                              <p className="text-xs text-on-surface-variant dark:text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ring-1 ${roleBadgeClass(member.role)}`}
                          >
                            {ROLE_LABEL[member.role]}
                          </span>
                        </td>
                        <td className="relative px-6 py-5 text-right">
                          <button
                            type="button"
                            aria-label="Member actions"
                            onClick={() => setMenuFor((cur) => (cur === member.id ? null : member.id))}
                            className="rounded-lg p-2 text-outline-variant transition-colors hover:bg-surface-container-high hover:text-primary dark:hover:bg-slate-800 dark:hover:text-indigo-300"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                          {menuFor === member.id ? (
                            <div className="absolute right-4 top-14 z-20 w-56 rounded-xl border border-outline-variant/30 bg-surface-container-high p-3 shadow-xl dark:border-slate-700/40 dark:bg-slate-800">
                              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-300">
                                Role
                              </p>
                              <select
                                value={member.role}
                                onChange={(e) => {
                                  void handleRoleChange(member, e.target.value as WorkspaceMemberRole);
                                }}
                                className="w-full cursor-pointer rounded-lg border-none bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 dark:text-slate-100"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => {
                                  void handleRemove(member);
                                }}
                                className="mt-3 w-full rounded-lg bg-error/10 px-3 py-2 text-left text-sm font-bold text-error transition-colors hover:bg-error/15 disabled:opacity-50"
                                disabled={removeMutation.isPending}
                              >
                                Remove from team
                              </button>

                              <button
                                type="button"
                                onClick={() => setMenuFor(null)}
                                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest dark:text-slate-300 dark:hover:bg-slate-700/50"
                              >
                                Close
                              </button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between bg-surface-container-low/50 px-6 py-4 text-xs text-on-surface-variant dark:bg-slate-900/40 dark:text-slate-400">
              <p>
                Showing {filtered.length} of {members.length} members
              </p>
            </div>
          </div>
        </div>
      </main>

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => !inviteMutation.isPending && setInviteOpen(false)}
        onInvite={handleInvite}
        loading={inviteMutation.isPending}
        error={inviteError}
      />
    </div>
  );
}
