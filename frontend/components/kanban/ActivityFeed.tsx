import { History, Sparkles } from "lucide-react";
import Image from "next/image";
import type { ActivityItem } from "@/types/kanban";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="hidden w-72 shrink-0 flex-col gap-6 xl:flex">
      <div className="rounded-2xl bg-surface-container-low p-6 dark:bg-slate-900/60">
        <h2 className="mb-6 flex items-center gap-2 font-headline text-sm font-bold text-on-surface dark:text-slate-100">
          <History className="size-4 text-primary" strokeWidth={1.75} />
          Activity Log
        </h2>
        <div className="flex flex-col gap-6">
          {items.map((item) =>
            item.kind === "user" ? (
              <div key={item.id} className="relative flex gap-4">
                {item.showConnector ? (
                  <div
                    className="absolute bottom-[-24px] left-[11px] top-6 w-px bg-outline-variant/25 dark:bg-slate-600/40"
                    aria-hidden
                  />
                ) : null}
                {item.avatar && (
                <Image
                  src={item.avatar}
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 shrink-0 rounded-full object-cover"
                  unoptimized
                />
              )}
                <div>
                  <p className="text-xs leading-relaxed text-on-surface dark:text-slate-200">
                    {item.body}
                  </p>
                  <span className="text-[10px] font-medium text-on-surface-variant dark:text-slate-500">
                    {item.time}
                  </span>
                </div>
              </div>
            ) : (
              <div key={item.id} className="flex gap-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary">
                  <Sparkles className="size-3.5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs leading-relaxed text-on-surface dark:text-slate-200">
                    {item.body}
                  </p>
                  <span className="text-[10px] font-medium text-on-surface-variant dark:text-slate-500">
                    {item.time}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
