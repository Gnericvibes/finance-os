"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();

    router.push("/sign-in");
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
    >
      Sign Out
    </button>
  );
}
