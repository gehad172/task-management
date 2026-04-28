"use client";

import Image from "next/image";
import { Bell, LogOut, Shield, User } from "lucide-react";
import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { MeDto, NotificationPrefsDto } from "@/types/api";
import { useChangePassword, useMe, useUpdateMe } from "@/lib/api/users";

function cardClassName(className = "") {
  return `rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60 ${className}`;
}

function inputClassName(className = "") {
  return `w-full rounded-lg border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-100 ${className}`;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg bg-surface-container-high px-4 py-3 text-left text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/60"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
        {label}
      </span>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-outline-variant/60 dark:bg-slate-700"
        }`}
      >
        <span
          className={`inline-block size-5 translate-x-0 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function SettingsContent({ me }: { me: MeDto }) {
  const updateMeMutation = useUpdateMe();
  const changePasswordMutation = useChangePassword();

  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio ?? "");
  const [avatar, setAvatar] = useState<string | null>(me.avatar ?? null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPrefsDto>(me.notificationPrefs);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    try {
      const url = await readFileAsDataUrl(file);
      setAvatar(url);
    } catch (err: unknown) {
      setAvatarError(err instanceof Error ? err.message : "Failed to load image");
    }
  };

  const saveProfile = async () => {
    setSaveError(null);
    setSaved(false);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setSaveError("Name is required");
      return;
    }

    try {
      await updateMeMutation.mutateAsync({
        name: trimmedName,
        bio: bio.trim(),
        avatar: avatar ?? undefined,
      });
      setSaved(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    }
  };

  const saveNotificationPrefs = async () => {
    setSaveError(null);
    setSaved(false);
    try {
      await updateMeMutation.mutateAsync({ notificationPrefs: prefs });
      setSaved(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save notification preferences");
    }
  };

  const changePassword = async () => {
    setPasswordError(null);
    setPasswordSaved(false);

    if (!currentPassword || !newPassword) {
      setPasswordError("Fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-on-surface-variant text-lg dark:text-slate-400">
          Manage your profile, security, and notifications.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <nav className="lg:col-span-3 space-y-1">
          <a
            href="#profile"
            className="flex items-center gap-3 rounded-xl bg-surface-container-lowest px-4 py-3 font-bold text-primary shadow-sm dark:bg-slate-800/60 dark:text-indigo-300"
          >
            <User className="h-5 w-5" />
            <span className="text-sm">Profile</span>
          </a>
          <a
            href="#security"
            className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high dark:text-slate-400 dark:hover:bg-slate-800/40"
          >
            <Shield className="h-5 w-5" />
            <span className="text-sm">Security</span>
          </a>
          <a
            href="#notifications"
            className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high dark:text-slate-400 dark:hover:bg-slate-800/40"
          >
            <Bell className="h-5 w-5" />
            <span className="text-sm">Notifications</span>
          </a>
        </nav>

        <div className="lg:col-span-9 space-y-8">
          {saveError ? (
            <p className="rounded-lg bg-error-container/15 px-4 py-3 text-sm font-semibold text-error" role="alert">
              {saveError}
            </p>
          ) : null}
          {saved ? (
            <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary dark:text-indigo-300">
              Saved.
            </p>
          ) : null}

          <section id="profile" className={cardClassName("space-y-8")}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-on-surface dark:text-white">Profile</h2>
              <button
                type="button"
                onClick={() => void saveProfile()}
                disabled={updateMeMutation.isPending}
                className="jewel-button rounded-lg px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {updateMeMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>

            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="relative">
                <div className="relative size-32 overflow-hidden rounded-3xl shadow-lg ring-2 ring-primary/10">
                  <Image src={avatar ?? "/default-avatar.png"} alt="" fill className="object-cover" unoptimized />
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute -bottom-2 -right-2 rounded-xl bg-primary p-2 text-on-primary shadow-xl transition-opacity hover:opacity-90"
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Edit</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    void handleFileChange(e);
                  }}
                  className="hidden"
                />
                {avatarError ? <p className="mt-2 text-xs font-semibold text-error">{avatarError}</p> : null}
              </div>

              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                    Full Name
                  </label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClassName()} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                    Email
                  </label>
                  <input value={me.email} readOnly className={inputClassName("opacity-70")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className={inputClassName("resize-none")}
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="security" className={cardClassName("space-y-6")}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-on-surface dark:text-white">Security</h2>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-lg bg-error-container/15 px-4 py-2.5 text-sm font-bold text-error transition-opacity hover:opacity-90"
              >
                <LogOut className="size-4" strokeWidth={1.75} />
                Logout
              </button>
            </div>

            {passwordError ? (
              <p className="rounded-lg bg-error-container/15 px-4 py-3 text-sm font-semibold text-error" role="alert">
                {passwordError}
              </p>
            ) : null}
            {passwordSaved ? (
              <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary dark:text-indigo-300">
                Password updated.
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClassName()}
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClassName()}
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClassName()}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void changePassword()}
                disabled={changePasswordMutation.isPending}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? "Updating..." : "Change Password"}
              </button>
            </div>
          </section>

          <section id="notifications" className={cardClassName("space-y-6")}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-on-surface dark:text-white">Notifications</h2>
              <button
                type="button"
                onClick={() => void saveNotificationPrefs()}
                disabled={updateMeMutation.isPending}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {updateMeMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                  In-app
                </p>
                <Toggle
                  label="Team invites"
                  checked={prefs.inApp.teamInvite}
                  onChange={(next) => setPrefs((p) => ({ ...p, inApp: { ...p.inApp, teamInvite: next } }))}
                />
                <Toggle
                  label="Task assignments"
                  checked={prefs.inApp.taskAssigned}
                  onChange={(next) => setPrefs((p) => ({ ...p, inApp: { ...p.inApp, taskAssigned: next } }))}
                />
                <Toggle
                  label="Deadline alerts"
                  checked={prefs.inApp.deadline}
                  onChange={(next) => setPrefs((p) => ({ ...p, inApp: { ...p.inApp, deadline: next } }))}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                  Email
                </p>
                <Toggle
                  label="Team invites"
                  checked={prefs.email.teamInvite}
                  onChange={(next) => setPrefs((p) => ({ ...p, email: { ...p.email, teamInvite: next } }))}
                />
                <Toggle
                  label="Task assignments"
                  checked={prefs.email.taskAssigned}
                  onChange={(next) => setPrefs((p) => ({ ...p, email: { ...p.email, taskAssigned: next } }))}
                />
                <Toggle
                  label="Deadline alerts"
                  checked={prefs.email.deadline}
                  onChange={(next) => setPrefs((p) => ({ ...p, email: { ...p.email, deadline: next } }))}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const meQuery = useMe();

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface dark:bg-background-dark dark:text-slate-100">
      <AppHeader />
      <AppSidebar />
      <main className="min-h-screen px-6 pb-24 pt-24 md:ml-64 md:px-8 md:pb-12">
        {meQuery.isLoading ? (
          <div className={cardClassName("mx-auto max-w-5xl")}>Loading settings...</div>
        ) : meQuery.data ? (
          <SettingsContent key={meQuery.data.id} me={meQuery.data} />
        ) : (
          <div className={cardClassName("mx-auto max-w-5xl")}>Failed to load settings.</div>
        )}
      </main>
    </div>
  );
}

