"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() =>
        router.back()
      }
      className="px-5 py-3 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition"
    >
      ← Back
    </button>
  );
}