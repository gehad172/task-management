"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { fetchBoardSummaries } from "@/lib/api/boards";

export default function WorkspaceIndexPage() {
  const router = useRouter();
  const [message, setMessage] = useState("جاري التوجيه…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const boards = await fetchBoardSummaries();
        if (cancelled) return;
        if (boards.length === 0) {
          setMessage("لا توجد لوحات. أنشئ لوحة من لوحة التحكم.");
          return;
        }
        router.replace(`/workspace/${boards[0].id}`);
      } catch (e) {
        if (cancelled) return;
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          await signOut({ callbackUrl: "/login" });
          return;
        }
        setMessage("تعذر الاتصال بالخادم. تأكد من تشغيل الـ API.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 dark:bg-background-dark">
      <p className="font-body text-on-surface-variant dark:text-slate-400">{message}</p>
    </div>
  );
}
