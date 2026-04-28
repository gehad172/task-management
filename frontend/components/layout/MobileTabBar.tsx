"use client";

import { BarChart3, LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Board", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const boardActive = pathname === "/dashboard" || pathname.startsWith("/workspace");

  return (
    <nav className="fixed bottom-0 z-50 flex w-full items-center justify-between bg-surface-container-lowest/95 px-6 py-3 backdrop-blur-md dark:bg-slate-950/95 md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.href === "/dashboard" ? boardActive : false;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center gap-1 ${active ? "text-primary" : "text-on-surface-variant"}`}
          >
            <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
            <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
