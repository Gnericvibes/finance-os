"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    try {
      setLoading(true);
      setError("");

      const { error: err } = await (authClient as any).requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (err) {
        setError(err.message || "Failed to send reset email");
        return;
      }

      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 rounded-3xl p-8 space-y-8 shadow-2xl">
        {sent ? (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Check Your Email</h1>
              <p className="text-zinc-400">
                We sent a password reset link to <strong>{email}</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-6 text-center text-sm text-green-400">
              Reset link sent! Check your inbox (or spam folder).
            </div>

            <button
              onClick={() => router.push("/sign-in")}
              className="w-full bg-white text-black font-semibold p-4 rounded-2xl transition hover:opacity-90"
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Reset Password</h1>
              <p className="text-zinc-400">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full border border-zinc-800 bg-zinc-900 p-4 rounded-2xl outline-none focus:border-white transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-white text-black font-semibold p-4 rounded-2xl transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            <div className="text-center text-sm text-zinc-500">
              <button
                onClick={() => router.push("/sign-in")}
                className="text-white hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
