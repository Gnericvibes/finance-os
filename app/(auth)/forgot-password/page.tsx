"use client";

import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 rounded-3xl p-8 space-y-8 shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-zinc-400">
            Password reset via email is not yet available
          </p>
        </div>

        <div className="text-center text-sm text-zinc-500">
          <button
            onClick={() => router.push("/sign-in")}
            className="text-white hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </main>
  );
}
