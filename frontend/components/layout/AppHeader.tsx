"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";

const navLinks = [
  { href: "/dashboard", label: "Board" },
  { href: "/analytics", label: "Analytics" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isWorkspace = pathname.startsWith("/workspace");
  const boardSection = pathname === "/dashboard" || isWorkspace;
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push("/dashboard");
    }
  };

  return (
    <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-surface/80 px-6 py-3 font-headline text-sm tracking-tight backdrop-blur-xl dark:bg-background-dark/85 md:px-8">
      <div className="flex items-center gap-8">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tighter text-primary dark:text-indigo-400"
        >
          The Editorial Kanban
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = link.href === "/dashboard" ? boardSection : false;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={
                  active
                    ? "rounded-lg bg-surface-container-lowest/90 px-3 py-1.5 font-bold text-primary shadow-[0_12px_40px_rgba(78,69,228,0.08)] dark:bg-slate-800/60 dark:text-indigo-300"
                    : "rounded-lg px-3 py-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-indigo-400"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden lg:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-[1.125rem] -translate-y-1/2 text-on-surface-variant"
            strokeWidth={1.75}
          />
          <input
            type="search"
            placeholder={isWorkspace ? "Search tasks..." : "Search boards..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className={`w-52 border-none bg-surface-container-high py-2 pl-10 pr-4 text-sm text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 sm:w-64 dark:bg-slate-800 dark:text-slate-100 ${isWorkspace ? "rounded-full py-1.5" : "rounded-lg py-2"}`}
          />
        </div>
        <ThemeToggle />
        <NotificationsMenu />
        <Image
          src={
            isWorkspace
              ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBwcUzMPbPcffli9HVTGP6hRcmf0ZKSrAK7HJjCj6uJgZgviwIfqZYFnqYgwZjE8Rui35eKk9XEtVVkhCyZnOmjCdWlqP903BZun8U4ABzpmY5rQHjV9oYSs_-4vIgeBARXSB9Dp7-v649b2oWmXwD8YPve3_Xc8dn8YNTVXJXh5HHoF9zAzeCFSIU6GLdtShin18UB7IXSaPASng7nDgpfQZLD8eNIk0vhFuntBxCKOyL-hkaolioH83IhczLxBcuQ-hfzH5iypF65"
              : "https://lh3.googleusercontent.com/aida-public/AB6AXuCSouCR851IG7XvF6Ig0o0fu-2PPaicAEWq6PEYEvxkDyqf4tBrwknvXVtfq8xVffDx0XF4HmXEWzsK1lDBUiNFm3ANh_fB1mHxMQDJqQv7diD9zriCdyorEIs-OUWZb21biMSd7IR7Q1Yw800T2Imse8rErIc3XYl3AYhowmc9zLVDEJFArVWxo_nUvwHDPGV92Css310u3Pc9W5F_WNAlADx4v0NS_78agULGUhQVWkuiAoEG2aRSPevcAFHG6-o0QzJJYSz_7Fee"
          }
          alt=""
          width={32}
          height={32}
          className="size-8 rounded-full object-cover ring-2 ring-primary/10"
          unoptimized
        />
      </div>
    </header>
  );
}
