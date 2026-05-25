"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSignUp() {
    try {
      setLoading(true);

      const result =
        await authClient.signUp.email({
          email,
          password,
          name,
        });

      console.log(
        "SIGNUP RESULT:",
        result
      );

      if (result.error) {
        alert(result.error.message);

        return;
      }

      alert("Account created");

      window.location.href =
        "/";
    } catch (error) {
      console.error(error);

      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Create Account
          </h1>

          <p className="text-gray-500">
            Start your Finance OS journey
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border p-3 rounded"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

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
          onClick={handleSignUp}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading
            ? "Creating..."
            : "Create Account"}
        </button>
      </div>
    </main>
  );
}