"use client";

import Link from "next/link";

interface Props {
  title: string;
  description: string;
}

export function OnboardingComplete({
  title,
  description,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
      <div className="space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-black text-3xl font-bold">
          ✓
        </div>

        <h1 className="text-3xl font-bold text-white">
          {title}
        </h1>

        <p className="max-w-xl text-zinc-400 text-lg leading-relaxed">
          {description}
        </p>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-left">
        <h2 className="text-lg font-semibold text-white mb-4">
          Your PFOS Blueprint Includes
        </h2>

        <div className="space-y-3 text-sm text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Income Allocation Engine</span>
            <span className="text-green-400">
              Ready
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Expense Optimization</span>
            <span className="text-green-400">
              Ready
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Debt Recovery Strategy</span>
            <span className="text-green-400">
              Ready
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Goal Tracking System</span>
            <span className="text-green-400">
              Ready
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Financial Health Score</span>
            <span className="text-green-400">
              Ready
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/allocations"
        className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-semibold text-black transition hover:scale-[1.02]"
      >
        Open PFOS Dashboard
      </Link>
    </div>
  );
}