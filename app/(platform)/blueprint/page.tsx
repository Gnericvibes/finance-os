"use client";

import { useEffect, useMemo, useState } from "react";

interface AllocationBlueprint {
  needs: number;
  savings: number;
  investments: number;
  debt: number;
  wants: number;
}

interface FinancialHealth {
  score: number;
  label: string;
  color: string;
}

export default function AllocationsPage() {
  const [userData, setUserData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const savedData =
      localStorage.getItem(
        "pfos-onboarding"
      );

    if (savedData) {
      setUserData(
        JSON.parse(savedData)
      );
    }

    setLoading(false);
  }, []);

  const calculations = useMemo(() => {
    if (!userData) return null;

    const income =
      Number(
        userData.mainMonthlyIncome || 0
      ) +
      Number(
        userData.additionalIncome || 0
      );

    const expenses =
      Number(
        userData.rentHousing || 0
      ) +
      Number(userData.food || 0) +
      Number(
        userData.transport || 0
      ) +
      Number(
        userData.utilitiesBills || 0
      ) +
      Number(
        userData.schoolFees || 0
      ) +
      Number(
        userData.otherExpenses || 0
      );

    const debt =
      Number(
        userData.totalDebtAmount || 0
      );

    const debtPayment =
      Number(
        userData
          .debtRepaymentAmount || 0
      );

    const hasDebt =
      userData.hasDebt === true;

    let allocation: AllocationBlueprint =
      {
        needs: 50,
        savings: 20,
        investments: 10,
        debt: 0,
        wants: 20,
      };

    /*
      PFOS Allocation Engine
    */

    if (hasDebt && debt > 0) {
      allocation = {
        needs: 50,
        savings: 10,
        investments: 5,
        debt: 25,
        wants: 10,
      };
    }

    if (
      userData.mainFinancialGoal ===
      "FINANCIAL_FREEDOM"
    ) {
      allocation.investments = 20;
      allocation.wants = 10;
    }

    if (
      userData.mainFinancialGoal ===
      "EMERGENCY_FUND"
    ) {
      allocation.savings = 30;
      allocation.wants = 10;
    }

    /*
      Financial Health Score
    */

    let score = 50;

    if (income > expenses)
      score += 20;

    if (
      expenses <= income * 0.7
    )
      score += 10;

    if (!hasDebt) score += 15;

    if (
      userData.interestedInInvesting
    )
      score += 5;

    score = Math.min(
      100,
      Math.max(0, score)
    );

    let health: FinancialHealth = {
      score,
      label: "Critical",
      color:
        "text-red-400 border-red-500/30 bg-red-500/10",
    };

    if (score >= 80) {
      health = {
        score,
        label: "Excellent",
        color:
          "text-green-400 border-green-500/30 bg-green-500/10",
      };
    } else if (score >= 60) {
      health = {
        score,
        label: "Stable",
        color:
          "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
      };
    }

    /*
      Emergency reserve target
    */

    const emergencyReserve =
      expenses * 6;

    /*
      Spending limits
    */

    const needsLimit =
      (income * allocation.needs) /
      100;

    const wantsLimit =
      (income * allocation.wants) /
      100;

    /*
      Investment readiness
    */

    const investmentReadiness =
      score >= 70
        ? "Ready to begin investing"
        : "Focus on stabilizing finances first";

    /*
      Debt priority
    */

    const debtPriority =
      hasDebt
        ? "High Priority"
        : "No active debt";

    const result = {
      income,
      expenses,
      allocation,
      health,
      emergencyReserve,
      debtPriority,
      wantsLimit,
      needsLimit,
      investmentReadiness,
      debtPayment,
    };

    /*
      Persist generated blueprint
    */

    localStorage.setItem(
      "pfos-blueprint",
      JSON.stringify(result)
    );

    return result;
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading PFOS Blueprint...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-3xl font-bold">
          No Onboarding Data Found
        </h1>

        <p className="text-zinc-400 text-center max-w-md">
          Complete onboarding first
          before generating your PFOS
          allocation system.
        </p>

        <a
          href="/onboarding"
          className="px-6 py-3 rounded-2xl bg-white text-black font-medium"
        >
          Start Onboarding
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            PFOS Blueprint
          </p>

          <h1 className="text-4xl font-bold">
            Your Financial Allocation
            System
          </h1>

          <p className="text-zinc-400 max-w-2xl">
            Your onboarding data has
            been transformed into a
            personalized PFOS operating
            structure.
          </p>
        </div>

        {/* HEALTH SCORE */}

        <div
          className={`rounded-3xl border p-6 ${calculations?.health.color}`}
        >
          <p className="text-sm uppercase tracking-wide opacity-70">
            Financial Health Score
          </p>

          <div className="mt-3 flex items-end gap-4">
            <h2 className="text-6xl font-bold">
              {
                calculations?.health
                  .score
              }
            </h2>

            <p className="text-xl font-medium mb-2">
              {
                calculations?.health
                  .label
              }
            </p>
          </div>
        </div>

        {/* ALLOCATION GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          {[
            {
              title: "Needs",
              value:
                calculations
                  ?.allocation.needs,
            },

            {
              title: "Savings",
              value:
                calculations
                  ?.allocation
                  .savings,
            },

            {
              title: "Investments",
              value:
                calculations
                  ?.allocation
                  .investments,
            },

            {
              title: "Debt",
              value:
                calculations
                  ?.allocation.debt,
            },

            {
              title: "Wants",
              value:
                calculations
                  ?.allocation.wants,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <p className="text-zinc-400 text-sm">
                {item.title}
              </p>

              <h3 className="mt-4 text-4xl font-bold">
                {item.value}%
              </h3>
            </div>
          ))}
        </div>

        {/* INSIGHTS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400 text-sm">
              Emergency Reserve Target
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              $
              {calculations?.emergencyReserve.toLocaleString()}
            </h3>

            <p className="mt-2 text-zinc-500 text-sm">
              Recommended 6 months
              reserve buffer.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400 text-sm">
              Debt Priority
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              {
                calculations?.debtPriority
              }
            </h3>

            <p className="mt-2 text-zinc-500 text-sm">
              Monthly repayment target:
              $
              {calculations?.debtPayment.toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400 text-sm">
              Needs Spending Limit
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              $
              {calculations?.needsLimit.toLocaleString()}
            </h3>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400 text-sm">
              Wants Spending Limit
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              $
              {calculations?.wantsLimit.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* INVESTMENT READINESS */}

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-zinc-400 text-sm uppercase tracking-wide">
            Investment Readiness
          </p>

          <h2 className="mt-4 text-3xl font-bold">
            {
              calculations?.investmentReadiness
            }
          </h2>

          <p className="mt-4 text-zinc-500 max-w-2xl">
            PFOS analyzes your income,
            expenses, debt structure,
            and financial goals before
            determining investment
            readiness.
          </p>
        </div>
      </div>
    </div>
  );
}