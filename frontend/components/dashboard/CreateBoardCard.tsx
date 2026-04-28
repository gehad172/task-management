import { Plus } from "lucide-react";

type CreateBoardCardProps = {
  onClick?: () => void;
};

export function CreateBoardCard({ onClick }: CreateBoardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-64 flex-col items-center justify-center rounded-xl bg-surface-container-low/80 transition-all duration-300 hover:bg-surface-container hover:shadow-[0_20px_50px_rgba(78,69,228,0.06)] dark:bg-slate-900/40 dark:hover:bg-slate-800/60"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-surface-container-high text-primary transition-transform duration-300 group-hover:scale-110 dark:bg-slate-800 dark:text-indigo-300">
        <Plus className="size-8" strokeWidth={1.75} />
      </div>
      <p className="font-headline text-lg font-bold text-primary dark:text-indigo-300">
        Create New Board
      </p>
      <p className="mt-1 text-sm text-on-surface-variant dark:text-slate-400">
        Start a fresh editorial cycle
      </p>
    </button>
  );
}
