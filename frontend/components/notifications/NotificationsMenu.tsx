"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMarkNotificationRead, useNotifications } from "@/lib/api/notifications";
import type { NotificationDto } from "@/types/api";

const EMPTY_NOTIFICATIONS: NotificationDto[] = [];

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const listQuery = useNotifications(20);
  const markRead = useMarkNotificationRead(20);

  const notifications = listQuery.data ?? EMPTY_NOTIFICATIONS;

  const unreadCount = useMemo(() => notifications.filter((n) => !n.readAt).length, [notifications]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onItemClick = (n: NotificationDto) => {
    if (!n.readAt && !markRead.isPending) {
      void markRead.mutateAsync(n.id);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high dark:text-slate-400 dark:hover:bg-slate-800/50"
      >
        <Bell className="size-5" strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-primary">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[90] cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-[100] mt-2 w-[22rem] overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-2xl dark:border-slate-700/40 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-3 dark:border-slate-700/40">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                Notifications
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-on-surface-variant hover:bg-surface-container-highest dark:text-slate-400 dark:hover:bg-slate-800/50"
              >
                Close
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {listQuery.isLoading ? (
                <div className="p-4 text-sm text-on-surface-variant dark:text-slate-400">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-sm text-on-surface-variant dark:text-slate-400">No notifications.</div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onItemClick(n)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-container-high dark:hover:bg-slate-800/50 ${
                      n.readAt ? "" : "bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-on-surface dark:text-slate-100">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-on-surface-variant dark:text-slate-400">
                          {n.message}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-outline-variant">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
