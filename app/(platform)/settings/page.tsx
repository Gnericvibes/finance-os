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
    <main className="space-y-8">
      {/* HEADER */}

      <section>
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-zinc-400">
          Manage your account settings and preferences
        </p>
      </section>

      {/* CHANGE PASSWORD */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Change Password</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Update your account password. You&apos;ll need your current password.
        </p>
        <ChangePasswordForm />
      </section>

      {/* SIGN OUT */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Sign Out</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Sign out of your account on this device.
        </p>
        <SignOutButton />
      </section>

      {/* ACCOUNT INFO */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Account</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-zinc-500">Email</p>
            <p className="text-white font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Name</p>
            <p className="text-white font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">User ID</p>
            <p className="text-white font-mono text-sm">{user.id}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
