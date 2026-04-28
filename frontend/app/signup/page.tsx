"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { registerRequest } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = async () => {
    setSocialLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Failed to start Google sign-in");
      setSocialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerRequest(form);
      const res = await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (res?.error) {
        setError("Account created but sign-in failed. Please log in manually.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          typeof err.response.data?.message === "string"
            ? err.response.data.message
            : "Registration failed",
        );
      } else {
        setError("Network error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-6 sm:p-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Branding Section */}
        <div className="lg:col-span-5 hidden lg:block space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 indigo-gradient rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>
            <span className="font-headline font-black text-2xl tracking-tight text-primary-fixed-dim">
              Editorial Kanban
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-on-surface leading-tight">
              The Disciplined <br />
              <span className="text-primary">Curator&apos;s</span> Canvas.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-sm leading-relaxed">
              Elevate your task management into a premium editorial experience. Experience productivity with atmospheric depth.
            </p>
          </div>
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <img
              className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
              src="https://via.placeholder.com/400x400?text=Workspace"
              alt="Workspace"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          </div>
        </div>
        {/* Sign Up Card */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="bg-surface-container-lowest shadow-lg rounded-xl p-8 sm:p-12 w-full max-w-md">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-on-surface mb-2">Create Account</h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Start your journey with Editorial Kanban.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">
                  Full Name
                </label>
                <input
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 px-5 text-on-surface placeholder-on-surface-variant/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Julianne Moore"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">
                  Email Address
                </label>
                <input
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 px-5 text-on-surface placeholder-on-surface-variant/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="julianne@editorial.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl py-4 px-5 pr-12 text-on-surface placeholder-on-surface-variant/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-error text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full indigo-gradient text-on-primary font-bold py-4 rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Initialize Workspace"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="my-8 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-surface-variant"></div>
              <span className="text-xs font-bold text-outline uppercase tracking-widest">Or Continue With</span>
              <div className="h-[1px] flex-1 bg-surface-variant"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleSocialLogin}
                disabled={socialLoading}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-semibold">
                  {socialLoading ? "Loading..." : "Google"}
                </span>
              </button>
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container rounded-xl opacity-50 cursor-not-allowed"
              >
                <svg className="w-5 h-5 fill-on-surface" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <span className="text-sm font-semibold">Apple</span>
              </button>
            </div>
            <div className="mt-12 text-center">
              <p className="text-on-surface-variant text-sm">
                Already have an account?
                <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4 decoration-2 ml-1">
                  Sign in to Board
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] -z-10"></div>
      <div className="fixed bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-tertiary/10 blur-[100px] -z-10"></div>
    </div>
  );
}
