import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";

import { SignOutButton } from "@/app/(platform)/settings/sign-out-button";
import { ChangePasswordForm } from "@/app/(platform)/settings/change-password-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER with Sign Out */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your account settings</p>
          </div>
          <SignOutButton />
        </div>

        {/* ACCOUNT INFO */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-base font-semibold text-white mb-5">Account</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
              <p className="text-sm text-white font-medium mt-1 truncate">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Name</p>
              <p className="text-sm text-white font-medium mt-1">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">User ID</p>
              <p className="text-sm text-white font-mono mt-1 truncate">{user.id}</p>
            </div>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="p-6">
            <h2 className="text-base font-semibold text-white mb-1">Change Password</h2>
            <p className="text-sm text-zinc-500 mb-5">Update your account password</p>
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </main>
  );
}
