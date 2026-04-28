"use client";

import { X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { WorkspaceMemberRole } from "@/types/api";

type InviteMemberModalProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: { email: string; role: WorkspaceMemberRole }) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

const ROLES: { value: WorkspaceMemberRole; label: string }[] = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

export function InviteMemberModal({ open, onClose, onInvite, loading = false, error }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceMemberRole>("viewer");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || loading) return;
    await onInvite({ email: trimmed, role });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/20 p-4 backdrop-blur-md dark:bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-member-title"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container-lowest/95 shadow-2xl backdrop-blur-xl dark:bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 id="invite-member-title" className="font-headline text-2xl font-extrabold text-on-surface dark:text-slate-100">
                Invite Member
              </h2>
              <p className="text-sm text-on-surface-variant dark:text-slate-400">Add a collaborator to your workspace</p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 transition-colors hover:bg-surface-container-high disabled:opacity-50 dark:hover:bg-slate-800"
            >
              <X className="size-5 text-on-surface-variant" strokeWidth={1.75} />
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? (
              <p className="rounded-lg bg-error-container/15 px-3 py-2 text-sm text-error" role="alert">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="e.g. editor@company.com"
                className="w-full rounded-lg border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as WorkspaceMemberRole)}
                disabled={loading}
                className="w-full cursor-pointer rounded-lg border-none bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="jewel-button rounded-lg px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Inviting..." : "Send Invite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
