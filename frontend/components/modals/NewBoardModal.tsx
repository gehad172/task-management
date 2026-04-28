"use client";

import axios from "axios";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { createBoard } from "@/lib/api/boards";

type NewBoardModalProps = {
  open: boolean;
  onClose: () => void;
  /** After a successful create, before navigating away (e.g. refresh dashboard list). */
  onCreated?: (boardId: string) => void | Promise<void>;
};

const BOARD_TYPES = ["Kanban Board", "Editorial Calendar", "Asset Library"] as const;
const PRIVACY_OPTIONS = ["Team Only", "Private", "Public"] as const;

export function NewBoardModal({ open, onClose, onCreated }: NewBoardModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>(BOARD_TYPES[0]);
  const [privacy, setPrivacy] = useState<string>(PRIVACY_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setType(BOARD_TYPES[0]);
    setPrivacy(PRIVACY_OPTIONS[0]);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const board = await createBoard({
        title: trimmed,
        description: description.trim() || undefined,
        type,
        privacy,
      });
      await onCreated?.(board.id);
      resetForm();
      onClose();
      router.push(`/workspace/${board.id}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        onClose();
        resetForm();
        await signOut({ callbackUrl: "/login" });
        return;
      }
      let msg = "تعذر إنشاء اللوحة. تحقق من الاتصال بالخادم.";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: unknown } | undefined;
        if (data?.message != null) {
          msg = Array.isArray(data.message) ? data.message.join(", ") : String(data.message);
        } else if (err.message) {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/20 p-4 backdrop-blur-md dark:bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-board-title"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container-lowest/95 shadow-2xl backdrop-blur-xl dark:bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2
                id="new-board-title"
                className="font-headline text-2xl font-extrabold text-on-surface dark:text-slate-100"
              >
                New Board
              </h2>
              <p className="text-sm text-on-surface-variant dark:text-slate-400">
                Define your project parameters
              </p>
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
              <label
                htmlFor="new-board-project-title"
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400"
              >
                Project Title
              </label>
              <input
                id="new-board-project-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="e.g. Q4 Content Strategy"
                className="w-full rounded-lg border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label
                htmlFor="new-board-description"
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400"
              >
                Description
              </label>
              <textarea
                id="new-board-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                placeholder="Briefly describe the editorial scope..."
                className="w-full resize-none rounded-lg border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-board-type"
                  className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400"
                >
                  Type
                </label>
                <select
                  id="new-board-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading}
                  className="w-full cursor-pointer rounded-lg border-none bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100"
                >
                  {BOARD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="new-board-privacy"
                  className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400"
                >
                  Privacy
                </label>
                <select
                  id="new-board-privacy"
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  disabled={loading}
                  className="w-full cursor-pointer rounded-lg border-none bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100"
                >
                  {PRIVACY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
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
                disabled={loading || !title.trim()}
                className="jewel-button rounded-lg px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "جاري الإنشاء…" : "Launch Board"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
