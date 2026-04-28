"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { signOut } from "next-auth/react";
import { fetchBoardSummaries, fetchBoardKanban } from "@/lib/api/boards";
import type { ActivityDto } from "@/types/api";

type AnalyticsData = {
  totalBoards: number;
  totalTasks: number;
  activityPulse: number;
  taskDistribution: { todo: number; inProgress: number; done: number };
  recentActivities: ActivityDto[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boards = await fetchBoardSummaries();
      const totalBoards = boards.length;

      let totalTasks = 0;
      const taskDistribution = { todo: 0, inProgress: 0, done: 0 };
      const allActivities: ActivityDto[] = [];

      // Fetch kanban data for each board
      const kanbanPromises = boards.map(board => fetchBoardKanban(board.id));
      const kanbans = await Promise.all(kanbanPromises);

      kanbans.forEach(kanban => {
        kanban.columns.forEach(column => {
          const count = column.tasks.length;
          totalTasks += count;
          if (column.meta.id === "todo") taskDistribution.todo += count;
          else if (column.meta.id === "in_progress") taskDistribution.inProgress += count;
          else if (column.meta.id === "done") taskDistribution.done += count;
        });
        allActivities.push(...kanban.activity);
      });

      // Sort activities by time descending and take latest 5
      const recentActivities = allActivities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

      const activityPulse = allActivities.length;

      setData({
        totalBoards,
        totalTasks,
        activityPulse,
        taskDistribution,
        recentActivities,
      });
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        await signOut({ callbackUrl: "/login" });
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const maxTasks = Math.max(
    data?.taskDistribution.todo || 0,
    data?.taskDistribution.inProgress || 0,
    data?.taskDistribution.done || 0
  );

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface dark:bg-background-dark dark:text-slate-100">
      <AppHeader />
      <AppSidebar />
      <main className="min-h-screen px-6 pb-24 pt-24 md:ml-64 md:px-8 md:pb-12">
        <div className="mb-10">
          <h1 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="max-w-lg font-body text-on-surface-variant dark:text-slate-400">
            Insights into your project boards, tasks, and activity trends.
          </p>
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl border border-outline-variant/25 bg-surface-container-lowest dark:border-slate-700/40 dark:bg-slate-900/60"
                ></div>
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-xl border border-outline-variant/25 bg-surface-container-lowest dark:border-slate-700/40 dark:bg-slate-900/60"></div>
            <div className="h-48 animate-pulse rounded-xl border border-outline-variant/25 bg-surface-container-lowest dark:border-slate-700/40 dark:bg-slate-900/60"></div>
          </div>
        ) : data ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
              <div className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h3 className="font-headline text-lg font-semibold">Total Boards</h3>
                </div>
                <p className="text-3xl font-bold text-primary">{data.totalBoards}</p>
              </div>
              <div className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="font-headline text-lg font-semibold">Total Tasks</h3>
                </div>
                <p className="text-3xl font-bold text-primary">{data.totalTasks}</p>
              </div>
              <div className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h3 className="font-headline text-lg font-semibold">Activity Pulse</h3>
                </div>
                <p className="text-3xl font-bold text-primary">{data.activityPulse}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="mb-8 rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60">
              <h3 className="font-headline text-xl font-semibold mb-4">Task Distribution</h3>
              <div className="flex items-end gap-4 h-32">
                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t mb-2"
                    style={{ height: maxTasks > 0 ? `${(data.taskDistribution.todo / maxTasks) * 100}%` : '0%' }}
                  ></div>
                  <span className="text-sm text-on-surface-variant dark:text-slate-400">To Do</span>
                  <span className="font-bold">{data.taskDistribution.todo}</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-secondary-container rounded-t mb-2"
                    style={{ height: maxTasks > 0 ? `${(data.taskDistribution.inProgress / maxTasks) * 100}%` : '0%' }}
                  ></div>
                  <span className="text-sm text-on-surface-variant dark:text-slate-400">In Progress</span>
                  <span className="font-bold">{data.taskDistribution.inProgress}</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-tertiary-container rounded-t mb-2"
                    style={{ height: maxTasks > 0 ? `${(data.taskDistribution.done / maxTasks) * 100}%` : '0%' }}
                  ></div>
                  <span className="text-sm text-on-surface-variant dark:text-slate-400">Done</span>
                  <span className="font-bold">{data.taskDistribution.done}</span>
                </div>
              </div>
            </div>

            {/* Recent Insights */}
            <div className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60">
              <h3 className="font-headline text-xl font-semibold mb-4">Recent Insights</h3>
              <div className="space-y-3">
                {data.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg bg-surface-container-low p-3 dark:bg-slate-800/40"
                  >
                    {activity.avatar && (
                      <div className="relative size-8 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/10">
                        <Image src={activity.avatar} alt="" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">
                        {activity.segments.map((segment, i) => {
                          if (segment.type === "bold") return <strong key={i}>{segment.value}</strong>;
                          if (segment.type === "primary") return <span key={i} className="text-primary">{segment.value}</span>;
                          if (segment.type === "italic") return <em key={i}>{segment.value}</em>;
                          return <span key={i}>{segment.value}</span>;
                        })}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant dark:text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
                {data.recentActivities.length === 0 && (
                  <p className="text-on-surface-variant dark:text-slate-400">No recent activities</p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
