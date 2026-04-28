"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BoardCard, BoardToolbar } from "@/components/dashboard/BoardCard";
import { CreateBoardCard } from "@/components/dashboard/CreateBoardCard";
import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { NewBoardModal } from "@/components/modals/NewBoardModal";
import { useAuth } from "@/hooks/useAuth";
import { fetchBoardSummaries } from "@/lib/api/boards";
import { mapBoardSummaryToCard } from "@/lib/map-board-card";
import type { BoardCardData } from "@/types/dashboard";

const heroAvatars = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAehWyWjivT6Ux0PPqxbO6B4nGaMMqwjovfDlsMcbb5c07y_M2sL4AKMp3A9xjmkvS3dXocaIn-DPhXv1CpLb7fMNxEa-XbHKzkvozrKsP_YjHPU8Da495DHRsMc8zRup4e95JJN9PhpoqsB08-MoexNxhjvuw_BNhr3p5KmGfKP_EVxEEsov38M-FBwGvSv0pjIYUUryFXgCQhz_iMVOYxg60zRANHVkX-TQX9GI2WNKBroGFH_xkooKX8ELI6x1HPsoPKkR2yJ5lY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBU-Tb-cAWYH4zmxK4XF7s78kE4cLSAsmHRZUie1xl40JCpF3WxcxBBMC5vgGzVUggwKELIGfnMxy04sdKFWPDonEMZDTUR-c_EIP01aEsNYrlVIdSGFJkDvotb9pkrJ94zN_TU6ujtQzGlhV_RocXSifBSBk2XBzRTT3J60Q3JFdRz7IlDAalz-00_kUtXLBZZhZCSxS_C9r37rYP_b2nDd6ZLW5WOVyJgIUjSDB3SLZIn5Yh5Fv74I89SQDc9Qlt4HS893PmLNFqpN",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDLYwbOtvPfTmyKIIxX5y3AGMa53QY3VqHYa1e_kofoKwdp1EHmB2H39zwgGFDhFlYn9C2kkHFW6wnNn1fMeyEm0a1gqr4HI7vUI1U-Bsxmej6r_Rzxo_LpSaud--3hwuA7KtQ44bscjDx_wGPMHeM611ZnIhcfvFaFgxYfWLO0OD58wrFSh6RL4zxESGL0Y8bOW4W3Xa2TTCxMh3TV1osyIb9gHdoClAw0kX5bcKGshAD5ARb5Q29Oi2ymlkPkAAcUrN40A-phlA09",
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, logout } = useAuth();
  const [newBoardOpen, setNewBoardOpen] = useState(false);
  const [boards, setBoards] = useState<BoardCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    await fetchBoardSummaries()
      .then((list) => {
        setBoards(list.map(mapBoardSummaryToCard));
      })
      .catch((e: unknown) => {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        setError(e instanceof Error ? e.message : "طھط¹ط°ط± طھط­ظ…ظٹظ„ ط§ظ„ظ„ظˆط­ط§طھ");
        setBoards([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, logout, router]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    void loadBoards();
  }, [isAuthenticated, isHydrated, loadBoards, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 dark:bg-background-dark">
        <p className="font-body text-on-surface-variant dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface dark:bg-background-dark dark:text-slate-100">
      <AppHeader />
      <AppSidebar onNewProject={() => setNewBoardOpen(true)} />
      <main className="min-h-screen px-6 pb-24 pt-24 md:ml-64 md:px-8 md:pb-12">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface dark:text-white">
              Project Workspace
            </h1>
            <p className="max-w-lg font-body text-on-surface-variant dark:text-slate-400">
              Curate your editorial workflow. Manage, track, and publish with precision across your
              active project boards.
            </p>
            {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {heroAvatars.map((src, i) => (
                <Image
                  key={`hero-${i}`}
                  src={src}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full border-4 border-surface object-cover dark:border-background-dark"
                  unoptimized
                />
              ))}
              <div className="flex size-10 items-center justify-center rounded-full border-4 border-surface bg-surface-container text-xs font-bold text-on-surface-variant dark:border-background-dark dark:bg-slate-800">
                +12
              </div>
            </div>
            <BoardToolbar />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <CreateBoardCard onClick={() => setNewBoardOpen(true)} />
          {loading ? (
            <p className="col-span-full text-on-surface-variant">ط¬ط§ط±ظٹ طھط­ظ…ظٹظ„ ط§ظ„ظ„ظˆط­ط§طھâ€¦</p>
          ) : (
            boards.map((board) => <BoardCard key={board.id} board={board} onRefresh={loadBoards} />)
          )}
        </div>
        <DashboardInsights />
      </main>
      <MobileTabBar />
      <NewBoardModal open={newBoardOpen} onClose={() => setNewBoardOpen(false)} />
    </div>
  );
}
