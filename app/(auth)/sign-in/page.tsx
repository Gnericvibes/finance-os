"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

    const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] =
    useState(false);

    const [error, setError] =
      useState("");

    async function handleSignIn() {
      try {
        setLoading(true);

        setError("");

        const result =
          await authClient.signIn.email({
            email,
            password,
          });

        console.log(
          "SIGNIN RESULT:",
          result
        );

        if (result.error) {
          setError(
            result.error.message ?? "Sign in failed"
          );

          return;
        }

        window.location.href = "/allocations";
      } catch (error) {
        console.error(error);

        setError(
          "Sign in failed"
        );
      } finally {
        setLoading(false);
      }
    }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 rounded-3xl p-8 space-y-8 shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="text-zinc-400">
            Sign in to continue
            into your PFOS
            dashboard
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-zinc-800 bg-zinc-900 p-4 rounded-2xl outline-none focus:border-white transition"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

                    <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border border-zinc-800 bg-zinc-900 p-4 pr-12 rounded-2xl outline-none focus:border-white transition"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" x2="23" y1="1" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right -mt-2">
            <button
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-zinc-500 hover:text-white transition"
            >
              Forgot password?
            </button>
          </div>
        </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-white text-black font-semibold p-4 rounded-2xl transition hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Signing In..."
            : "Sign In"}
        </button>

        <div className="text-center text-sm text-zinc-500">
          Don’t have an
          account?{" "}
          <button
            onClick={() =>
              router.push(
                "/sign-up"
              )
            }
            className="text-white hover:underline"
          >
            Create Account
          </button>
        </div>
      </div>
    </main>
  );
}