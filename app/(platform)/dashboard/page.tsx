import { redirect } from "next/navigation";

import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureMonthlySnapshot } from "@/lib/ensure-monthly-snapshot";
import { EntryForm } from "@/features/entries/components/entry-form";

import {
  DashboardEngine,
  type DashboardEntry,
  type AllocationComparison,
} from "@/features/dashboard/services/dashboard-engine";

export default async function DashboardPage() {
  /*
   -----------------------------------
   GET SESSION
   -----------------------------------
  */

  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  /*
   -----------------------------------
   PROTECT ROUTE
   -----------------------------------
  */

    if (!session?.user) {
    redirect("/sign-in");
  }

  await ensureMonthlySnapshot(session.user.id);


  /*
   -----------------------------------
   FETCH ENTRIES
   -----------------------------------
  */

        const entries =
    await db.entry.findMany({
      where: {
        userId: session.user.id,
      },

      include: {
        category: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const normalizedEntries = entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    amount: Number(entry.amount),
    isDeleted: entry.isDeleted,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    userId: entry.userId,
    accountId: entry.accountId,
    categoryId: entry.categoryId,
    categoryName: entry.category?.name ?? "Uncategorized",
  }));

  const engineEntries: DashboardEntry[] = normalizedEntries.map((entry) => ({
    type: entry.type,
    amount: entry.amount,
    category: entry.categoryName,
  }));


  /*
   -----------------------------------
   ANALYTICS
   -----------------------------------
  */

    const income = DashboardEngine.getIncome(engineEntries);

  const expenses = DashboardEngine.getExpenses(engineEntries);

  const investments = DashboardEngine.getInvestments(engineEntries);

  const cashFlow = DashboardEngine.getCashFlow(engineEntries);

  const savingsRate = DashboardEngine.getSavingsRate(engineEntries);

  const totalDebtPaid = engineEntries
    .filter((e) => e.type === "DEBT_PAYMENT")
    .reduce((s, e) => s + e.amount, 0);

  const profile = await db.financialProfile.findUnique({
    where: { userId: session.user.id },
  });

  const totalDebtOwed = Number(profile?.totalDebt ?? 0);

const remainingDebt = Math.max(0, totalDebtOwed - totalDebtPaid);






    /*
   -----------------------------------
   SPENDING BREAKDOWN
   -----------------------------------
  */

    const expenseBreakdown =
    DashboardEngine.getExpenseBreakdown(engineEntries);

  /*
   -----------------------------------
   BUDGET ALLOCATION COMPARISON
   -----------------------------------
  */

    const blueprint = await db.financialBlueprint.findFirst({
    where: { userId: session.user.id, isActive: true },
    orderBy: { version: "desc" },
  });

  const totalOperationalBudget = blueprint
    ? Number(blueprint.operationalAllocation)
    : 0;

  // Compute recommended amounts from HouseholdExpenseProfile (user's stated expenses)
  // scaled to fit within the PFOS operational budget
  const expenseProfile = await db.householdExpenseProfile.findUnique({
    where: { userId: session.user.id },
  });

  const statedExpenses: { category: string; amount: number }[] = [
    { category: "Housing", amount: Number(expenseProfile?.rentHousing ?? 0) },
    { category: "Food", amount: Number(expenseProfile?.food ?? 0) },
    { category: "Transportation", amount: Number(expenseProfile?.transport ?? 0) },
    { category: "Utilities", amount: Number(expenseProfile?.utilities ?? 0) },
    { category: "Healthcare", amount: Number(expenseProfile?.healthCare ?? 0) },
    { category: "Education", amount: Number(expenseProfile?.schoolFees ?? 0) },
    { category: "Lifestyle", amount: Number(expenseProfile?.subscriptions ?? 0) },
    { category: "Misc", amount: Number(expenseProfile?.miscellaneousExpenses ?? 0) },
  ];

  const totalStated = statedExpenses.reduce((s, e) => s + e.amount, 0);

  // Build allocation data with live recomputed recommended amounts
  let allocationData: { category: string; recommended: number; percentage: number }[] = [];

    if (totalStated > 0 && totalOperationalBudget > 0) {
    // Use the user's stated expenses directly as the recommended amounts
    // but cap them so they don't exceed the PFOS operational budget
    // (reserve 10% of the operational budget for Emergency & Family buffers)
    const allocatableBudget = totalOperationalBudget * 0.9;

    if (totalStated <= allocatableBudget) {
      // User's stated expenses fit within the PFOS operational budget
      // Use stated amounts directly — no scaling needed
      allocationData = statedExpenses.map((exp) => {
        const recommended = Math.round(exp.amount);
        return {
          category: exp.category,
          recommended,
          percentage: recommended / totalOperationalBudget,
        };
      });
    } else {
      // User's stated expenses exceed the PFOS operational budget
      // Scale down proportionally to fit
      allocationData = statedExpenses.map((exp) => {
        const userRatio = exp.amount / totalStated;
        const recommended = Math.round(allocatableBudget * userRatio);
        return {
          category: exp.category,
          recommended,
          percentage: recommended / totalOperationalBudget,
        };
      });
    }

    const allocatedSum = allocationData.reduce((s, a) => s + a.recommended, 0);
    const bufferRemaining = totalOperationalBudget - allocatedSum;

    if (bufferRemaining > 0) {
      allocationData.push({
        category: "Emergency",
        recommended: Math.round(bufferRemaining * 0.25),
        percentage: (bufferRemaining * 0.25) / totalOperationalBudget,
      });
      allocationData.push({
        category: "Family",
        recommended: Math.round(bufferRemaining * 0.75),
        percentage: (bufferRemaining * 0.75) / totalOperationalBudget,
      });
    }
  } else {
    // Fallback: use stored BudgetAllocation records with whatever recommended values they have
    const budgetAllocations = await db.budgetAllocation.findMany({
      where: { userId: session.user.id },
    });

    allocationData = budgetAllocations.map((a) => ({
      category: a.category,
      recommended: Number(a.recommended),
      percentage: a.percentage,
    }));
  }

    let allocationComparisons: AllocationComparison[] = [];

    if (allocationData.length > 0) {
      allocationComparisons = DashboardEngine.compareWithAllocations(
        expenseBreakdown,
        allocationData,
        totalOperationalBudget
      );
    } else if (expenseBreakdown.length > 0) {
      // No budget allocations yet, show raw expense breakdown as comparison with 0 recommended
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

      const allocationAlerts =
      DashboardEngine.generateAllocationAlerts(allocationComparisons);

    // Sort: CRITICAL first (most overspent), then OVER, then by difference descending
    const sortedComparisons = [...allocationComparisons].sort((a, b) => {
      const statusRank: Record<string, number> = {
        CRITICAL: 0,
        OVER: 1,
        ON_TRACK: 2,
        UNDER: 3,
      };
      const rankDiff = (statusRank[a.status] ?? 99) - (statusRank[b.status] ?? 99);
      if (rankDiff !== 0) return rankDiff;
      // Within same status, sort by difference percentage descending (most over first)
      return b.differencePercentage - a.differencePercentage;
    });





  /*
   -----------------------------------
   DASHBOARD UI
   -----------------------------------
  */

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="space-y-2">
          <h1 className="text-5xl font-bold">
            Dashboard
          </h1>

          <p className="text-zinc-400 text-lg">
            Welcome back{" "}
            {session.user.name ||
              "User"}
          </p>
        </div>

        {/* LIVE ANALYTICS */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 hover:border-zinc-600 transition-all">
      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-3 text-white">
        {value}
      </h3>
    </div>
  );
}
