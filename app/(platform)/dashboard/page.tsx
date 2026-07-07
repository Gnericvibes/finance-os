import { redirect } from "next/navigation";

import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureMonthlySnapshot } from "@/lib/ensure-monthly-snapshot";
import { loadUserFinancialData, computeAllocationData } from "@/lib/load-user-financial-data";
import { EntryForm } from "@/features/entries/components/entry-form";

import {
  DashboardEngine,
  type DashboardEntry,
  type AllocationComparison,
} from "@/features/dashboard/services/dashboard-engine";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  await ensureMonthlySnapshot(session.user.id);

  /*
   -----------------------------------
   BATCH LOAD ALL DATA
   -----------------------------------
  */

  const { profile, blueprint, expenseProfile, entryData } = await loadUserFinancialData(session.user.id);

  /*
   -----------------------------------
   ANALYTICS
   -----------------------------------
  */

  const income = DashboardEngine.getIncome(entryData);
  const expenses = DashboardEngine.getExpenses(entryData);
  const investments = DashboardEngine.getInvestments(entryData);
  const cashFlow = DashboardEngine.getCashFlow(entryData);
  const savingsRate = DashboardEngine.getSavingsRate(entryData);

  const totalDebtPaid = entryData
    .filter((e) => e.type === "DEBT_PAYMENT")
    .reduce((s, e) => s + e.amount, 0);

  const totalDebtOwed = Number(profile?.totalDebt ?? 0);
  const remainingDebt = Math.max(0, totalDebtOwed - totalDebtPaid);

  const expenseBreakdown = DashboardEngine.getExpenseBreakdown(entryData);

  /*
   -----------------------------------
   BUDGET ALLOCATION COMPARISON
   -----------------------------------
  */

  const totalOperationalBudget = blueprint ? Number(blueprint.operationalAllocation) : 0;

  const allocationData = computeAllocationData(expenseProfile, totalOperationalBudget);

  let allocationComparisons: AllocationComparison[] = [];

  if (allocationData.length > 0) {
    allocationComparisons = DashboardEngine.compareWithAllocations(
      expenseBreakdown,
      allocationData,
      totalOperationalBudget
    );
  } else if (expenseBreakdown.length > 0) {
    allocationComparisons = expenseBreakdown.map((item) => ({
      category: item.category,
      recommended: 0,
      actual: item.amount,
      percentage: item.percentage,
      recommendedPercentage: 0,
      difference: item.amount,
      differencePercentage: 100,
      status: "CRITICAL" as const,
    }));
  }

  const allocationAlerts = DashboardEngine.generateAllocationAlerts(allocationComparisons);

  const sortedComparisons = [...allocationComparisons].sort((a, b) => {
    const statusRank: Record<string, number> = {
      CRITICAL: 0,
      OVER: 1,
      ON_TRACK: 2,
      UNDER: 3,
    };
    const rankDiff = (statusRank[a.status] ?? 99) - (statusRank[b.status] ?? 99);
    if (rankDiff !== 0) return rankDiff;
    return b.differencePercentage - a.differencePercentage;
  });





  /*
   -----------------------------------
   DASHBOARD UI
   -----------------------------------
  */

  return (
    <main className="min-h-screen bg-black text-white p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* HEADER */}

        <div className="space-y-1">
          <h1 className="text-3xl lg:text-5xl font-bold">
            Dashboard
          </h1>

          <p className="text-zinc-400 text-base lg:text-lg">
            Welcome back{" "}
            {session.user.name ||
              "User"}
          </p>
        </div>

        {/* LIVE ANALYTICS */}

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-6">
          <Link href="/analytics/income" className="block">
            <AnalyticsCard
              title="Income"
              value={`₦${income.toLocaleString()}`}
            />
          </Link>

          <Link href="/analytics/expenses" className="block">
            <AnalyticsCard
              title="Expenses"
              value={`₦${expenses.toLocaleString()}`}
            />
          </Link>

          <Link href="/analytics/investments" className="block">
            <AnalyticsCard
              title="Investments"
              value={`₦${investments.toLocaleString()}`}
            />
          </Link>


          <AnalyticsCard
            title="Cash Flow"
            value={`₦${cashFlow.toLocaleString()}`}
          />

                    <AnalyticsCard
            title="Live Savings Rate"
            value={`${savingsRate}%`}
          />

          <Link href="/analytics/debt-payment" className="block">
            <AnalyticsCard
              title="Remaining Debt"
              value={`₦${remainingDebt.toLocaleString()}`}
            />
          </Link>
        </div>

        {/* ALLOCATION ALERTS */}

        {allocationAlerts.length > 0 && (
          <div className="border border-red-900 bg-red-950/20 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-400">
                Budget Alerts
              </h2>

              <p className="text-xs text-red-300">
                Overspending Detected
              </p>
            </div>

            <div className="space-y-2">
              {allocationAlerts.map((alert, index) => (
                <p key={index} className="text-sm text-red-200">
                  • {alert}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* SPENDING BREAKDOWN */}

        <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Spending Breakdown
            </h2>

            <p className="text-sm text-zinc-400">
              Actual vs Budget Allocation
            </p>
          </div>

          <div className="space-y-5">
                        {sortedComparisons.length === 0 ? (
              <p className="text-zinc-500">
                No expense data or budget allocations yet.
              </p>
            ) : (
              sortedComparisons.map((item) => {
                const statusColor =
                  item.status === "CRITICAL"
                    ? "text-red-400"
                    : item.status === "OVER"
                    ? "text-orange-400"
                    : item.status === "UNDER"
                    ? "text-yellow-400"
                    : "text-green-400";

                const barColor =
                  item.status === "CRITICAL"
                    ? "bg-red-500"
                    : item.status === "OVER"
                    ? "bg-orange-500"
                    : item.status === "UNDER"
                    ? "bg-yellow-500"
                    : "bg-green-500";

                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {item.category}
                        </p>

                        <p className="text-sm text-zinc-400">
                          ₦{item.actual.toLocaleString()} spent
                          {" / "}₦{item.recommended.toLocaleString()} allocated
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`font-bold ${statusColor}`}>
                          {item.differencePercentage > 0 ? "+" : ""}
                          {item.differencePercentage}%
                        </p>

                        <p className="text-xs text-zinc-500 uppercase">
                          {item.status.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden relative">
                      {/* Bar showing actual spending */}
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{
                          width: `${Math.min(
                            totalOperationalBudget > 0
                              ? (item.actual / totalOperationalBudget) * 100
                              : 0,
                            100
                          )}%`,
                        }}
                      />

                      {/* Marker for recommended allocation */}
                      <div
                        className="absolute top-0 h-full w-0.5 bg-white/60"
                        style={{
                          left: `${Math.min(
                            totalOperationalBudget > 0
                              ? (item.recommended / totalOperationalBudget) * 100
                              : 0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

                {/* ENTRY FORM */}

                <EntryForm />
      </div>
    </main>
  );
}

/*
 -----------------------------------
 ANALYTICS CARD
 -----------------------------------
*/

function AnalyticsCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl lg:rounded-3xl p-4 lg:p-6 hover:border-zinc-600 transition-all">
      <p className="text-xs lg:text-sm text-zinc-400">
        {title}
      </p>

      <h3 className="text-xl lg:text-3xl font-bold mt-2 lg:mt-3 text-white">
        {value}
      </h3>
    </div>
  );
}
