import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { AnalyticsTable } from "@/features/analytics/components/analytics-table";

import { AnalyticsChart } from "@/features/analytics/components/analytics-chart";

export default async function ExpensesAnalyticsPage() {
  /*
   -----------------------------------
   SESSION
   -----------------------------------
  */

  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user) {
    redirect("/sign-in");
  }

  /*
   -----------------------------------
   FETCH EXPENSES
   -----------------------------------
  */

  const expenses =
    await db.entry.findMany({
      where: {
        userId: session.user.id,

        type: "EXPENSE",
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  /*
   -----------------------------------
   TOTAL
   -----------------------------------
  */

  const totalExpenses =
    expenses.reduce(
      (acc, entry) =>
        acc + entry.amount,
      0
    );

  /*
   -----------------------------------
   CATEGORY BREAKDOWN
   -----------------------------------
  */

  const categoryMap =
    new Map<
      string,
      number
    >();

  expenses.forEach((entry) => {
    const current =
      categoryMap.get(
        entry.category
      ) || 0;

    categoryMap.set(
      entry.category,
      current + entry.amount
    );
  });

  const chartData =
    Array.from(
      categoryMap.entries()
    ).map(
      ([category, amount]) => ({
        month: category,
        total: amount,
      })
    );

  /*
   -----------------------------------
   UI
   -----------------------------------
  */

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">
              Expense Analytics
            </h1>

            <p className="text-zinc-400 mt-2">
              Deep spending intelligence
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 rounded-2xl px-6 py-5">
            <p className="text-sm text-zinc-400">
              Total Expenses
            </p>

            <h2 className="text-3xl font-bold mt-1">
              ₦
              {totalExpenses.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* CHART */}

        <AnalyticsChart
          data={chartData}
        />

        {/* TABLE */}

        <AnalyticsTable
          entries={expenses}
        />
      </div>
    </main>
  );
}