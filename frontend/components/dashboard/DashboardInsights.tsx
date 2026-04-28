import { ArrowRight, Command, Lightbulb } from "lucide-react";

export function DashboardInsights() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="flex flex-col items-center gap-8 rounded-2xl bg-indigo-50/30 p-8 lg:col-span-8 md:flex-row dark:bg-indigo-950/20">
        <div className="flex-1">
          <h2 className="mb-2 font-headline text-2xl font-extrabold text-indigo-900 dark:text-indigo-100">
            Weekly Productivity Insight
          </h2>
          <p className="mb-6 text-indigo-700/80 dark:text-indigo-200/70">
            Your team has moved{" "}
            <span className="font-bold text-indigo-900 dark:text-indigo-50">42 tasks</span> to
            Published this week. Outperforming last week by 15%.
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-indigo-800 dark:text-indigo-100">
                88%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Completion Rate
              </span>
            </div>
            <div
              className="hidden h-10 w-2 shrink-0 rounded-full bg-indigo-200/60 sm:block dark:bg-indigo-800/50"
              aria-hidden
            />
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-indigo-800 dark:text-indigo-100">
                1.2d
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Avg Lead Time
              </span>
            </div>
          </div>
        </div>
        <div className="relative h-40 w-full overflow-hidden rounded-xl bg-surface-container-lowest/60 backdrop-blur-sm dark:bg-slate-900/40 md:w-64">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <svg className="h-full w-full px-4" viewBox="0 0 200 100" aria-hidden>
            <path
              d="M0,80 Q25,75 50,60 T100,65 T150,30 T200,45 L200,100 L0,100 Z"
              fill="url(#insightGrad)"
              opacity={0.2}
            />
            <path
              d="M0,80 Q25,75 50,60 T100,65 T150,30 T200,45"
              fill="none"
              stroke="#4e45e4"
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="insightGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#4e45e4" stopOpacity={1} />
                <stop offset="100%" stopColor="#4e45e4" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>
      <section className="flex flex-col justify-between rounded-2xl bg-tertiary-container/30 p-8 lg:col-span-4 dark:bg-fuchsia-950/20">
        <div>
          <h3 className="mb-4 font-headline text-lg font-bold text-on-tertiary-container dark:text-fuchsia-100">
            Workspace Tips
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-on-tertiary-container/85 dark:text-fuchsia-100/80">
              <Lightbulb className="size-5 shrink-0 text-tertiary dark:text-fuchsia-300" strokeWidth={1.75} />
              <span>Use Ghost Move to drag tasks between boards instantly.</span>
            </li>
            <li className="flex gap-3 text-sm text-on-tertiary-container/85 dark:text-fuchsia-100/80">
              <Command className="size-5 shrink-0 text-tertiary dark:text-fuchsia-300" strokeWidth={1.75} />
              <span>Press Cmd + K to open the global editorial search.</span>
            </li>
          </ul>
        </div>
        <button
          type="button"
          className="mt-6 flex items-center gap-1 text-sm font-bold text-tertiary transition-all hover:gap-2 dark:text-fuchsia-200"
        >
          Explore all shortcuts
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </button>
      </section>
    </div>
  );
}
