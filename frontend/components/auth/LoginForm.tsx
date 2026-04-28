"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSocialLogin = async () => {
    try {
      setError(null);
      setSocialLoading(true);
      await login({ provider: "google", callbackUrl: "/dashboard" });
    } catch {
      setError("Failed to initialize Google sign-in");
      setSocialLoading(false);
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login({
      provider: "credentials",
      email: email.trim(),
      password,
      callbackUrl: "/dashboard",
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
    setLoading(false);
  }

  if (!mounted) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-10 shadow-[0_20px_50px_rgba(78,69,228,0.06)] dark:bg-slate-900">
      <div className="absolute left-0 top-0 h-1 w-full opacity-80 indigo-gradient" />
      <div className="flex flex-col space-y-8">
        <header>
          <h2 className="font-headline text-2xl font-bold text-on-surface dark:text-slate-100">Welcome back</h2>
          <p className="mt-1 text-sm text-on-surface-variant dark:text-slate-400">
            Login to your account to continue
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <p className="rounded-lg bg-error-container/15 px-3 py-2 text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="ml-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@kanban.local"
              disabled={loading}
              className="w-full rounded-lg border-none bg-surface-container-high px-4 py-3.5 text-sm text-on-surface transition-all focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                Password
              </label>
              <Link href="#" className="text-[11px] font-bold text-primary hover:text-primary-dim">
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full rounded-lg border-none bg-surface-container-high px-4 py-3.5 text-sm text-on-surface transition-all focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="jewel-button w-full rounded-lg py-4 font-headline text-sm font-bold tracking-wide text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In to Workspace"}
          </button>
        </form>

        <div className="relative flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-surface-container-highest dark:bg-slate-700" />
          <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-outline-variant">
            or continue with
          </span>
          <div className="h-px flex-1 bg-surface-container-highest dark:bg-slate-700" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleSocialLogin}
            disabled={socialLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-surface-container-low py-3 hover:bg-surface-container-high dark:bg-slate-800"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-primary dark:bg-slate-700">
              {socialLoading ? "..." : "G"}
            </span>
            <span className="text-xs font-semibold text-on-surface dark:text-slate-100">
              Google
            </span>
          </button>

          <button type="button" className="flex items-center justify-center gap-2 rounded-lg bg-surface-container-low py-3 hover:bg-surface-container-high dark:bg-slate-800">
            <Smartphone className="size-4 text-on-surface-variant" strokeWidth={1.75} />
            <span className="text-xs font-semibold text-on-surface dark:text-slate-100">
              Apple
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
