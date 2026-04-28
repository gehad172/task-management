"use client";

import { CheckSquare, Clock, ListFilter, MoreVertical, Star, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { archiveBoard, deleteBoard, updateBoard } from "@/lib/api/boards";
import type { BoardCardData } from "@/types/dashboard";

function MetaRow({ meta }: { meta: BoardCardData["meta"] }) {
  const icon =
    meta.kind === "tasks" ? (
      <CheckSquare className="size-4 shrink-0" strokeWidth={1.75} />
    ) : meta.kind === "critical" ? (
      <TriangleAlert className="size-4 shrink-0" strokeWidth={1.75} />
    ) : meta.kind === "schedule" ? (
      <Clock className="size-4 shrink-0" strokeWidth={1.75} />
    ) : (
      <Star className="size-4 shrink-0" strokeWidth={1.75} />
    );

  const textClass =
    meta.kind === "critical"
      ? "text-xs font-medium text-error"
      : "text-xs text-on-surface-variant";

  return (
    <div className={`flex items-center gap-1 ${textClass}`}>
      {icon}
      <span>{meta.primary}</span>
      {meta.secondary ? <span className="text-on-surface-variant">{meta.secondary}</span> : null}
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: BoardCardData["statusTone"];
}) {
  const classes: Record<BoardCardData["statusTone"], string> = {
    active: "bg-secondary-container text-on-secondary-container",
    planning: "bg-surface-container-highest text-on-surface-variant",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    critical: "bg-secondary-container text-on-secondary-container",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${classes[tone]}`}
    >
      {label}
    </span>
  );
}

type BoardCardProps = {
  board: BoardCardData;
  href?: string;
  onRefresh?: () => void;
};

export function BoardCard({ board, href, onRefresh }: BoardCardProps) {
  const to = href ?? `/workspace/${board.id}`;
  const Icon = board.icon;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleEdit = async () => {
    setMenuOpen(false);
    const newTitle = window.prompt("New title", board.title);
    if (newTitle && newTitle.trim() && newTitle.trim() !== board.title) {
      try {
        await updateBoard(board.id, { title: newTitle.trim() });
        onRefresh?.();
      } catch (error) {
        console.error("Failed to update board:", error);
      }
    }
  };

  const handleArchive = async () => {
    setMenuOpen(false);
    try {
      await archiveBoard(board.id);
      onRefresh?.();
    } catch (error) {
      console.error("Failed to archive board:", error);
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        await deleteBoard(board.id);
        onRefresh?.();
      } catch (error) {
        console.error("Failed to delete board:", error);
      }
    }
  };

  return (
    <div className="relative">
      <Link
        href={to}
        className="group flex flex-col justify-between rounded-xl bg-surface-container-lowest p-6 shadow-none transition-all duration-300 hover:shadow-[0_20px_50px_rgba(78,69,228,0.08)] dark:bg-slate-900/50"
      >
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div
            className={`flex size-12 items-center justify-center rounded-lg ${board.iconWrapperClassName}`}
          >
            <Icon className="size-6" strokeWidth={1.5} />
          </div>
          <StatusPill label={board.statusLabel} tone={board.statusTone} />
        </div>
        <h3 className="mb-2 font-headline text-xl font-bold tracking-tight text-on-surface dark:text-white">
          {board.title}
        </h3>
        <p className="mb-6 font-body text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
          {board.description}
        </p>
      </div>
      <div className="mt-4 rounded-lg bg-surface-container-low p-4 dark:bg-slate-800/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex -space-x-2">
            {board.memberAvatars.map((src, i) => (
              <Image
                key={`${board.id}-m-${i}`}
                src={src}
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full border-2 border-surface-container-lowest object-cover dark:border-slate-900"
                unoptimized
              />
            ))}
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <MetaRow meta={board.meta} />
            <span
              role="button"
              tabIndex={0}
              aria-label="Board actions"
              className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }
              }}
            >
              <MoreVertical className="size-5" strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="absolute right-4 top-16 z-10 rounded-lg bg-surface-container-high p-2 shadow-lg dark:bg-slate-800">
          <button
            onClick={handleEdit}
            className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-container-highest dark:hover:bg-slate-700"
          >
            Edit
          </button>
          <button
            onClick={handleArchive}
            className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-container-highest dark:hover:bg-slate-700"
          >
            Archive
          </button>
          <button
            onClick={handleDelete}
            className="block w-full rounded px-3 py-2 text-left text-sm text-error hover:bg-surface-container-highest dark:hover:bg-slate-700"
          >
            Delete
          </button>
        </div>
      )}
    </Link>
    </div>
  );
}

export function BoardToolbar() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-highest dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      <ListFilter className="size-[1.125rem]" strokeWidth={1.75} />
      Filter
    </button>
  );
}
