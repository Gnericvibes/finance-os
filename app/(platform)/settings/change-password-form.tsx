"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function ChangePasswordForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("idle");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("New password must be at least 8 characters.");
      return;
    }

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Failed to change password.");
      return;
    }

    setStatus("success");
    setMessage("Password changed successfully.");
    (event.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="currentPassword" className="block text-sm text-zinc-400 mb-1">
          Current Password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm text-zinc-400 mb-1">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm text-zinc-400 mb-1">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            status === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200 transition-colors"
      >
        Change Password
      </button>
    </form>
  );
}
