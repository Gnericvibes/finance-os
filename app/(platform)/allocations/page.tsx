"use client";

import {
  generatePFOS,
} from "@/lib/pfos-engine";

import { useState } from "react";

export default function AllocationsPage() {
  const [userName] =
    useState("John"); // later from auth

  const baseIncome = 4000;

  const extraIncome = 500; // bonus/raise display only

  const pfos =
    generatePFOS({
      income: baseIncome,
      hasDebt: true,
      totalDebt: 6000,
    });

  const health =
    pfos.financialHealthScore;

  return (
    <main className="space-y-10">

      {/* HEADER */}

      <div>
        <h1 className="text-4xl font-bold text-white">
          {userName} Blueprint
        </h1>

        <p className="mt-2 text-zinc-400">
          Your personalized financial intelligence system
        </p>
      </div>

      {/* INCOME INTELLIGENCE */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">

        <h2 className="text-xl font-semibold text-white">
          Income Snapshot
        </h2>

        <div className="text-white text-3xl font-bold">
          ${baseIncome.toLocaleString()}
        </div>

        <p className="text-zinc-400 text-sm">
          Base monthly income (used for PFOS calculations)
        </p>

        {extraIncome > 0 && (
          <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/30 p-4">
            <p className="text-green-400 font-semibold">
              +${extraIncome} additional income detected this month
            </p>

            <p className="text-zinc-400 text-sm mt-1">
              This is shown for awareness only and does NOT affect PFOS baseline calculations until next update.
            </p>
          </div>
        )}
      </section>

      {/* FINANCIAL HEALTH VISUAL */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">

        <h2 className="text-xl font-semibold text-white">
          Financial Health Score
        </h2>

        <div className="flex items-end gap-3 h-32">

          {/* BAR */}
          <div
            className="w-16 bg-gradient-to-t from-green-500 to-emerald-300 rounded-xl"
            style={{
              height: `${health}%`,
            }}
          />

          <div className="text-5xl font-bold text-white">
            {health}/100
          </div>

        </div>

        <p className="text-zinc-400">
          Based on debt load, allocation balance, and financial stability signals
        </p>
      </section>

      {/* ALLOCATION TABLE */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

        <h2 className="text-xl font-semibold text-white mb-6">
          Allocation Breakdown
        </h2>

        <table className="w-full text-left">

          <thead>
            <tr className="text-zinc-400 border-b border-zinc-800">
              <th className="pb-3">Category</th>
              <th className="pb-3">%</th>
              <th className="pb-3">Amount</th>
            </tr>
          </thead>

          <tbody className="text-white">

            <tr className="border-b border-zinc-900">
              <td className="py-4">Operations</td>
              <td>{pfos.percentages.operations}%</td>
              <td>${pfos.allocations.operations.toFixed(2)}</td>
            </tr>

            <tr className="border-b border-zinc-900">
              <td className="py-4">Debt</td>
              <td>{pfos.percentages.debt}%</td>
              <td>${pfos.allocations.debt.toFixed(2)}</td>
            </tr>

            <tr className="border-b border-zinc-900">
              <td className="py-4">Investing</td>
              <td>{pfos.percentages.investing}%</td>
              <td>${pfos.allocations.investing.toFixed(2)}</td>
            </tr>

            <tr>
              <td className="py-4">Emergency</td>
              <td>{pfos.percentages.emergency}%</td>
              <td>${pfos.allocations.emergency.toFixed(2)}</td>
            </tr>

          </tbody>
        </table>
      </section>

    </main>
  );
}