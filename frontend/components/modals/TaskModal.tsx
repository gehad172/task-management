"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Plus, MessageSquare, ThumbsUp, Reply } from "lucide-react";
import type { BoardMemberDto } from "@/types/api";
import type { KanbanTask } from "@/types/kanban";
import { fetchBoardMembers, postTaskComment, updateTask } from "@/lib/api/tasks";

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

type TaskModalProps = {
  boardId: string;
  task: KanbanTask | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: KanbanTask) => void;
};

export function TaskModal({ boardId, task, isOpen, onClose, onTaskUpdated }: TaskModalProps) {
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<KanbanTask["priority"]>("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [members, setMembers] = useState<BoardMemberDto[]>([]);
  const [assigneeQuery, setAssigneeQuery] = useState("");

  useEffect(() => {
    if (!isOpen || !task) return;
    setDeadline(task.deadline ? task.deadline.slice(0, 10) : "");
    setPriority(task.priority);
    setAssignedTo(task.assignedTo?.id ?? "");
    setAssigneeQuery("");
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen || !task || !boardId) return;
    let active = true;
    void fetchBoardMembers(boardId).then((list) => {
      if (active) setMembers(list);
    });
    return () => {
      active = false;
    };
  }, [boardId, isOpen, task]);

  const handlePostComment = async () => {
    if (!task) return;
    if (!comment.trim() || posting) return;

    setPosting(true);
    try {
      const updated = await postTaskComment(task.id, comment.trim());
      setComment("");
      onTaskUpdated(updated);
    } catch {
      // Errors surface via axios; keep UI simple
    } finally {
      setPosting(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const q = assigneeQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [assigneeQuery, members]);

  const handleSaveDetails = async () => {
    if (!task) return;
    if (saving) return;
    setSaving(true);
    try {
      const trimmedDeadline = deadline.trim();
      const deadlinePayload =
        trimmedDeadline === "" ? null : dateInputToIsoUtc(trimmedDeadline) ?? undefined;

      const updated = await updateTask(task.id, {
        priority,
        ...(deadlinePayload === undefined ? {} : { deadline: deadlinePayload }),
        assignedTo: assignedTo || null,
      });
      onTaskUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDescriptionBlur = async (value: string) => {
    if (!task) return;
    const nextDescription = value.trim();
    if ((task.description ?? "") === nextDescription) return;
    const updated = await updateTask(task.id, { description: nextDescription || undefined });
    onTaskUpdated(updated);
  };

  const handleMarkComplete = async () => {
    if (!task) return;
    if (saving) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, { status: "done" });
      onTaskUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const priorityBadgeClass =
    priority === "high"
      ? "bg-red-500/15 text-red-700 ring-red-500/25 dark:text-red-300"
      : priority === "medium"
      ? "bg-amber-500/15 text-amber-800 ring-amber-500/25 dark:text-amber-200"
      : "bg-slate-500/15 text-slate-700 ring-slate-500/25 dark:text-slate-300";

  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/20 p-4 backdrop-blur-md dark:bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Task details"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-lowest/95 text-on-surface shadow-2xl backdrop-blur-xl dark:bg-slate-900/95 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-surface-container-high dark:hover:bg-slate-800"
        >
          <X className="size-5 text-on-surface-variant" strokeWidth={1.75} />
        </button>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-3">

          <div className="lg:col-span-2 space-y-8">
            <header>
              <p className="text-xs font-bold uppercase tracking-widest text-primary dark:text-indigo-400">
                {task.project || "Project Name"} / {task.category || "Feature"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{task.title}</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ring-1 ${priorityBadgeClass}`}
                >
                  {priority}
                </span>
              </div>
            </header>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant uppercase dark:text-slate-400">
                <MessageSquare className="size-4" /> Narrative
              </h3>
              <textarea
                defaultValue={task.description}
                onBlur={(e) => {
                  void handleDescriptionBlur(e.target.value);
                }}
                className="w-full min-h-[120px] resize-none rounded-lg border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
              />
            </section>

            <section className="space-y-6 border-t border-outline-variant/25 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                Editorial Feedback
              </h3>

              <div className="space-y-6">
                {task.comments?.map((c) => (
                  <div key={c._id} className="flex gap-4 group">
                    <div className="relative size-10 shrink-0">
                      <Image src={c.authorAvatar || "/default-avatar.png"} alt={c.authorName} fill className="rounded-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{c.authorName}</span>
                        <span className="text-[10px] text-outline-variant">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-on-surface-variant dark:text-slate-300">{c.content}</p>
                      <div className="flex gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="flex items-center gap-1 text-[10px] text-outline-variant hover:text-primary"><ThumbsUp className="size-3" /> {c.likes || 0}</button>
                        <button type="button" className="flex items-center gap-1 text-[10px] text-outline-variant hover:text-primary"><Reply className="size-3" /> Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <div className="flex-1 relative">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full resize-none rounded-lg border-none bg-surface-container-high px-4 py-3 pr-16 text-sm text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handlePostComment}
                    disabled={posting}
                    className="absolute bottom-2.5 right-2.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {posting ? "..." : "Post"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8 rounded-2xl bg-surface-container-low p-6 dark:bg-slate-900/50">
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                Task Details
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full cursor-pointer rounded-lg border-none bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                      Priority
                    </label>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest ring-1 ${priorityBadgeClass}`}
                    >
                      {priority}
                    </span>
                  </div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as KanbanTask["priority"])}
                    className="w-full cursor-pointer rounded-lg border-none bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                    Assignee
                  </label>
                  <input
                    value={assigneeQuery}
                    onChange={(e) => setAssigneeQuery(e.target.value)}
                    placeholder="Search member..."
                    className="mb-2 w-full rounded-lg border-none bg-surface-container-high px-4 py-3 text-sm text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full cursor-pointer rounded-lg border-none bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Unassigned</option>
                    {filteredMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    void handleSaveDetails();
                  }}
                  className="jewel-button w-full rounded-lg px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Details"}
                </button>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {task.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary dark:text-indigo-300"
                  >
                    {tag}
                  </span>
                ))}
                <button
                  type="button"
                  className="rounded-full border border-dashed border-outline-variant/60 p-1 transition-colors hover:bg-surface-container-high dark:hover:bg-slate-800"
                >
                  <Plus className="size-3 text-on-surface-variant" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleMarkComplete();
              }}
              disabled={saving || task.status === "done"}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
