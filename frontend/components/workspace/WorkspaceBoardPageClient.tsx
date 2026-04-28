"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ListFilter, SortAsc } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { NewBoardModal } from "@/components/modals/NewBoardModal";
import { TaskModal } from "@/components/modals/TaskModal";
import { ApiError } from "@/lib/api/client";
import { fetchBoardKanban } from "@/lib/api/boards";
import { signOut } from "next-auth/react";
import { mapActivityDtosToItems } from "@/lib/map-activity";
import type { ActivityDto, KanbanColumnDto, KanbanResponseDto } from "@/types/api";
import type { KanbanTask } from "@/types/kanban";

type WorkspaceBoardPageClientProps = {
  boardId: string;
};

export function WorkspaceBoardPageClient({ boardId }: WorkspaceBoardPageClientProps) {
  const router = useRouter();
  const [data, setData] = useState<KanbanResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KanbanTask | null>(null);
  const [newBoardOpen, setNewBoardOpen] = useState(false);

  const load = useCallback(async () => {
    if (!boardId) return;

    try {
      const response = await fetchBoardKanban(boardId);
      setData(response);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load board");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [boardId, router]);

  useEffect(() => {
    let isMounted = true;

    const initLoad = async () => {
      if (isMounted) {
        await load();
      }
    };

    initLoad();

    return () => {
      isMounted = false;
    };
  }, [load]);

  const handleTaskCreated = useCallback((task: KanbanTask, activity: ActivityDto) => {
    setData((prev) => {
      if (!prev) return prev;
      const columns = prev.columns.map((column) =>
        column.meta.id === task.status
          ? { ...column, tasks: [...column.tasks, task] }
          : column
      );
      return {
        ...prev,
        columns,
        activity: [activity, ...prev.activity],
      };
    });
  }, []);

  const handleTaskUpdated = useCallback((updatedTask: KanbanTask) => {
    setSelected((current) => (current && current.id === updatedTask.id ? updatedTask : current));
    setData((prev) => {
      if (!prev) return prev;
      const nextColumns = prev.columns.map((column) => ({
        ...column,
        tasks: [...column.tasks],
      }));

      let sourceColumnIndex = -1;
      let sourceTaskIndex = -1;

      for (let i = 0; i < nextColumns.length; i += 1) {
        const foundIndex = nextColumns[i].tasks.findIndex((task) => task.id === updatedTask.id);
        if (foundIndex !== -1) {
          sourceColumnIndex = i;
          sourceTaskIndex = foundIndex;
          break;
        }
      }

      const targetColumnIndex = nextColumns.findIndex((column) => column.meta.id === updatedTask.status);
      if (targetColumnIndex === -1) return prev;

      if (sourceColumnIndex !== -1 && sourceTaskIndex !== -1) {
        nextColumns[sourceColumnIndex].tasks.splice(sourceTaskIndex, 1);
      }

      if (sourceColumnIndex === targetColumnIndex && sourceTaskIndex !== -1) {
        nextColumns[targetColumnIndex].tasks.splice(sourceTaskIndex, 0, updatedTask);
      } else {
        nextColumns[targetColumnIndex].tasks.unshift(updatedTask);
      }

      return { ...prev, columns: nextColumns };
    });
  }, []);

  const handleTaskDelete = useCallback((taskId: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const columns = prev.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }));
      return { ...prev, columns };
    });
  }, []);

  const handleTaskMove = useCallback((newColumns: KanbanColumnDto[]) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: newColumns };
    });
  }, []);

  const activityItems = data ? mapActivityDtosToItems(data.activity) : [];

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface dark:bg-background-dark dark:text-slate-100">
      <AppHeader />
      <AppSidebar variant="workspace" onNewProject={() => setNewBoardOpen(true)} />
      <main className="min-h-screen overflow-x-auto px-6 pb-24 pt-24 md:ml-64 md:px-8 md:pb-12">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary-dim"
            >
              <ArrowLeft className="size-3.5" strokeWidth={2} />
              All boards
            </Link>
            {loading ? (
              <p className="font-headline text-lg text-on-surface-variant">Loading board...</p>
            ) : error ? (
              <p className="font-headline text-lg text-error">{error}</p>
            ) : (
              <>
                <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface dark:text-white">
                  {data?.board.title}
                </h1>
                <p className="font-medium text-on-surface-variant dark:text-slate-400">
                  {data?.board.subtitle}
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-2 flex -space-x-2">
              {data?.board.headerAvatars.map((src, index) => (
                <Image
                  key={`wa-${index}`}
                  src={src}
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 rounded-full border-2 border-surface object-cover dark:border-background-dark"
                  unoptimized
                />
              ))}
              {data?.board.headerOverflowLabel ? (
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-surface bg-surface-container-highest text-[10px] font-bold text-on-surface-variant dark:border-background-dark dark:bg-slate-800">
                  {data.board.headerOverflowLabel}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <ListFilter className="size-[1.125rem]" strokeWidth={1.75} />
              Filter
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <SortAsc className="size-[1.125rem]" strokeWidth={1.75} />
              Sort
            </button>
          </div>
        </div>
        {data && !error ? (
          <KanbanBoard
            boardId={boardId}
            columns={data.columns}
            activity={activityItems}
            onTaskOpen={setSelected}
            onTaskCreated={handleTaskCreated}
            onTaskMove={handleTaskMove}
            onRefresh={load}
          />
        ) : null}
      </main>
      <MobileTabBar />
      <TaskModal
        boardId={boardId}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        task={selected}
        onTaskUpdated={handleTaskUpdated}
      />
      <NewBoardModal open={newBoardOpen} onClose={() => setNewBoardOpen(false)} />
    </div>
  );
}
