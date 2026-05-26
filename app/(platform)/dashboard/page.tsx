import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { EntryForm } from "@/features/entries/components/entry-form";

import { DashboardEngine } from "@/features/dashboard/services/dashboard-engine";

import { SpendingChart } from "@/features/dashboard/components/spending-chart";

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

      orderBy: {
        createdAt: "desc",
      },

      take: 10,
    });

  /*
   -----------------------------------
   ANALYTICS
   -----------------------------------
  */

  const income =
    DashboardEngine.getIncome(
      entries
    );

  const expenses =
    DashboardEngine.getExpenses(
      entries
    );

  const investments =
    DashboardEngine.getInvestments(
      entries
    );

  const cashFlow =
    DashboardEngine.getCashFlow(
      entries
    );

  const savingsRate =
    DashboardEngine.getSavingsRate(
      entries
    );

  /*
   -----------------------------------
   SPENDING BREAKDOWN
   -----------------------------------
  */

  const expenseBreakdown =
    DashboardEngine.getExpenseBreakdown(
      entries
    );

  /*
   -----------------------------------
   SPENDING CHART DATA
   -----------------------------------
  */

  const spendingMap = new Map<
    string,
    number
  >();

  entries
    .filter(
      (entry) =>
        entry.type === "EXPENSE"
    )
    .forEach((entry) => {
      const current =
        spendingMap.get(
          entry.category
        ) || 0;

      spendingMap.set(
        entry.category,
        current + entry.amount
      );
    });

  const spendingData = Array.from(
    spendingMap.entries()
  ).map(([name, value]) => ({
    name,
    value,
  }));

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
          <a
            href="/analytics/income"
            className="block"
          >
            <AnalyticsCard
              title="Income"
              value={`₦${income.toLocaleString()}`}
            />
          </a>

          <a
            href="/analytics/expenses"
            className="block"
          >
            <AnalyticsCard
              title="Expenses"
              value={`₦${expenses.toLocaleString()}`}
            />
          </a>

          <a
            href="/analytics/investments"
            className="block"
          >
            <AnalyticsCard
              title="Investments"
              value={`₦${investments.toLocaleString()}`}
            />
          </a>

          <AnalyticsCard
            title="Cash Flow"
            value={`₦${cashFlow.toLocaleString()}`}
          />

          <AnalyticsCard
            title="Live Savings Rate"
            value={`${savingsRate}%`}
          />
        </div>

        {/* SPENDING BREAKDOWN */}

        <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Spending Breakdown
            </h2>

            <p className="text-sm text-zinc-400">
              Live Expense Categories
            </p>
          </div>

          <div className="space-y-5">
            {expenseBreakdown.length ===
            0 ? (
              <p className="text-zinc-500">
                No expense data yet.
              </p>
            ) : (
              expenseBreakdown.map(
                (item, index) => {
                  const colors = [
                    "bg-red-500",
                    "bg-orange-500",
                    "bg-yellow-500",
                    "bg-green-500",
                    "bg-cyan-500",
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-pink-500",
                  ];

                  return (
                    <div
                      key={
                        item.category
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {
                              item.category
                            }
                          </p>

                          <p className="text-sm text-zinc-400">
                            {
                              item.percentage
                            }
                            % of expenses
                          </p>
                        </div>

                        <p className="font-bold text-white">
                          ₦
                          {item.amount.toLocaleString()}
                        </p>
                      </div>

                      <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            colors[
                              index %
                                colors.length
                            ]
                          }`}
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>

        {/* SPENDING CHART */}

        <SpendingChart
          data={spendingData}
        />

        {/* ENTRY FORM */}

        <EntryForm />

        {/* RECENT ENTRIES */}

        <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Recent Transactions
            </h2>

            <p className="text-sm text-zinc-400">
              {entries.length} Entries
            </p>
          </div>

          <div className="space-y-4">
            {entries.length ===
            0 ? (
              <p className="text-zinc-500">
                No entries yet.
              </p>
            ) : (
              entries.map(
                (entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between border border-zinc-800 rounded-2xl p-4 bg-black/40"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {
                          entry.title
                        }
                      </p>

                      <p className="text-sm text-zinc-400">
                        {
                          entry.category
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg text-white">
                        ₦
                        {entry.amount.toLocaleString()}
                      </p>

                      <p className="text-xs text-zinc-500">
                        {entry.type.replaceAll(
                          "_",
                          " "
                        )}
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
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