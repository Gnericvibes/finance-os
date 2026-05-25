"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSignIn() {
    try {
      setLoading(true);

      const result =
        await authClient.signIn.email({
          email,
          password,
        });

      console.log(result);

      alert("Signed in");

      window.location.href =
        "/";
    } catch (error) {
      console.error(error);

      alert("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="text-gray-500">
            Sign in to Finance OS
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading
            ? "Signing In..."
            : "Sign In"}
        </button>
      </div>
    </main>
  );
}