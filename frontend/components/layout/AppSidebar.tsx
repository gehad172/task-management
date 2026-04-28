"use client";

import {
  BarChart3,
  CirclePlus,
  History,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Board", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type AppSidebarProps = {
  onNewProject?: () => void;
  /** Workspace layout uses a gradient tile icon like the Stitch mock. */
  variant?: "dashboard" | "workspace";
};

export function AppSidebar({ onNewProject, variant = "dashboard" }: AppSidebarProps) {
  const pathname = usePathname();
  const boardActive = pathname === "/dashboard" || pathname.startsWith("/workspace");

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-surface-container-low p-6 pt-24 dark:bg-slate-900 md:flex">
      <div className="space-y-1">
        <div className="mb-6 flex items-center gap-3 px-2">
          {variant === "workspace" ? (
            <div className="flex size-10 items-center justify-center rounded-xl text-on-primary shadow-lg indigo-gradient">
              <LayoutGrid className="size-5" strokeWidth={1.75} />
            </div>
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg text-sm font-bold text-on-primary indigo-gradient">
              EK
            </div>
          )}
          <div>
            <p className="font-headline text-sm font-bold text-primary dark:text-indigo-400">
              Main Workspace
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Editorial Flow
            </p>
          </div>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dashboard" ? boardActive : false;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={
                  active
                    ? "flex translate-x-1 items-center gap-3 rounded-lg bg-surface-container-lowest/80 px-4 py-3 font-bold text-primary shadow-[0_12px_32px_rgba(78,69,228,0.06)] dark:bg-slate-800/50 dark:text-indigo-300"
                    : "flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-indigo-400"
                }
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.75} />
                <span className="font-headline text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-2 rounded-xl bg-surface-container/60 p-4 dark:bg-slate-800/40">
        <button
          type="button"
          onClick={onNewProject}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/15 indigo-gradient transition-opacity hover:opacity-90"
        >
          <CirclePlus className="size-5" strokeWidth={1.75} />
          New Project
        </button>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-indigo-400"
        >
          <History className="size-5 shrink-0" strokeWidth={1.75} />
          <span className="font-headline text-sm font-medium">Activity Log</span>
        </Link>
      </div>
    </aside>
  );
}
