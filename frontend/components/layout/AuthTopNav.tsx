import { Search } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";

type AuthTopNavProps = {
  searchPlaceholder?: string;
  showSearch?: boolean;
};

export function AuthTopNav({
  searchPlaceholder = "Search...",
  showSearch = true,
}: AuthTopNavProps) {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between bg-surface/80 px-6 py-3 backdrop-blur-xl dark:bg-background-dark/85 md:px-8">
      <div className="flex items-center gap-8">
        <span className="font-headline text-xl font-bold tracking-tighter text-primary dark:text-indigo-400">
          The Editorial Kanban
        </span>
        {showSearch ? (
          <div className="hidden items-center gap-2 rounded-lg bg-surface-container-high px-3 py-1.5 md:flex dark:bg-slate-800/50">
            <Search className="size-4 text-on-surface-variant" strokeWidth={1.75} />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="w-48 border-none bg-transparent text-xs text-on-surface placeholder:text-outline-variant focus:ring-0 dark:text-slate-100"
            />
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        <NotificationsMenu />
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuADu1vurPESEO93im_YypGQkP-krLMaQeNHKlp6n5U_MORzpEhnG_psmHijPedAKlCzXJEWe1SXAjuHEq_IVuymvaiiBc89SScXpsZfe7_zQFtEvObZTUU_TdZnfoAC2Qc7NWfplXH8JvynAtn6XzVE1soWtAlJ-gS7_dhkUNJGFb4A6I7sgd-imuTufyTdau1p2dkOT3QMJQ2oob-XPN2b2LSAbMHeOQvgwiOu0RJ_Ige_xzAWLXDdMu9hhoHzG88r4ppvdmUiUKhe"
          alt=""
          width={32}
          height={32}
          className="size-8 cursor-pointer rounded-full object-cover ring-2 ring-primary/10 transition-transform duration-200 ease-out hover:scale-95"
          unoptimized
        />
      </div>
    </nav>
  );
}
