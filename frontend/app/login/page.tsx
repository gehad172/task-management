"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthTopNav } from "@/components/layout/AuthTopNav";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 dark:bg-background-dark">
        <p className="font-body text-on-surface-variant dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface dark:bg-background-dark">
      <AuthTopNav />
      <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-28">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-primary dark:text-indigo-400">
              The Editorial Kanban
            </h1>
            <p className="mt-2 text-sm font-medium tracking-tight text-on-surface-variant dark:text-slate-400">
              Curate your productivity.
            </p>
          </div>
          <LoginForm />
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-on-surface-variant dark:text-slate-400">
              Don&apos;t have an account?
              <Link href="/signup" className="ml-1 font-bold text-primary hover:underline">
                Create a Workspace
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[30%] w-[30%] rounded-full bg-tertiary/5 blur-[100px]" />
      </div>
    </div>
  );
}
