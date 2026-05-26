import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { BudgetEngine } from "@/features/budgets/services/budget-engine";

export default async function BudgetsPage() {
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
   FETCH BLUEPRINT
   -----------------------------------
  */

  const blueprint =
    await db.pFOSBlueprint.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  /*
   -----------------------------------
   FETCH BUDGETS
   -----------------------------------
  */

  const budgets =
    await db.budget.findMany({
      where: {
        userId: session.user.id,
      },

      include: {
        categories: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

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
    });

  /*
   -----------------------------------
   UI
   -----------------------------------
  */

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="space-y-3">
          <h1 className="text-5xl font-bold">
            Budget Intelligence
          </h1>

          <p className="text-zinc-400 text-lg">
            Behavioral finance monitoring
            and PFOS allocation tracking
          </p>
        </div>

        {/* EMPTY STATE */}

        {budgets.length === 0 && (
          <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-10 text-center">
            <p className="text-zinc-500 text-lg">
              No budgets created yet.
            </p>
          </div>
        )}

        {/* BUDGETS */}

        <div className="space-y-8">
          {budgets.map((budget) => {
            const analysis =
              BudgetEngine.analyzeBudget(
                budget.categories,
                entries,
                blueprint || undefined
              );

            /*
             -----------------------------------
             GLOBAL ALERTS
             -----------------------------------
            */

            const alerts =
              analysis.flatMap(
                (item) => item.alerts
              );

            return (
              <div
                key={budget.id}
                className="border border-zinc-800 bg-zinc-950 rounded-3xl p-8 space-y-8"
              >
                {/* TOP */}

                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {budget.name}
                    </h2>

                    <p className="text-zinc-400 mt-2">
                      {budget.month}/
                      {budget.year}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-zinc-500">
                      Categories
                    </p>

                    <p className="text-4xl font-bold">
                      {
                        budget.categories
                          .length
                      }
                    </p>
                  </div>
                </div>

                {/* ALERTS */}

                {alerts.length > 0 && (
                  <div className="border border-red-900 bg-red-950/20 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-red-400">
                        Financial Alerts
                      </h3>

                      <p className="text-sm text-red-300">
                        Live Risk Monitoring
                      </p>
                    </div>

                    <div className="space-y-2">
                      {alerts.map(
                        (
                          alert,
                          index
                        ) => (
                          <div
                            key={index}
                            className="text-sm text-red-200"
                          >
                            • {alert}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* ANALYSIS */}

                <div className="space-y-7">
                  {analysis.map(
                    (item) => {
                      const barColor =
                        item.riskLevel ===
                        "CRITICAL"
                          ? "bg-purple-500"
                          : item.riskLevel ===
                            "HIGH"
                          ? "bg-red-500"
                          : item.riskLevel ===
                            "MEDIUM"
                          ? "bg-yellow-500"
                          : "bg-green-500";

                      const textColor =
                        item.riskLevel ===
                        "CRITICAL"
                          ? "text-purple-400"
                          : item.riskLevel ===
                            "HIGH"
                          ? "text-red-400"
                          : item.riskLevel ===
                            "MEDIUM"
                          ? "text-yellow-400"
                          : "text-green-400";

                      return (
                        <div
                          key={
                            item.category
                          }
                          className="space-y-3"
                        >
                          {/* TOP */}

                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <p className="font-bold text-lg">
                                  {
                                    item.category
                                  }
                                </p>

                                <span
                                  className={`text-xs px-3 py-1 rounded-full border ${textColor}`}
                                >
                                  {
                                    item.riskLevel
                                  }
                                </span>
                              </div>

                              <p className="text-sm text-zinc-400">
                                ₦
                                {item.spent.toLocaleString()}
                                {" / "}
                                ₦
                                {item.limit.toLocaleString()}
                              </p>

                              {item.pfos && (
                                <p className="text-xs text-zinc-500">
                                  PFOS Bucket:
                                  {" "}
                                  {
                                    item.pfos
                                      .bucket
                                  }
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <p
                                className={`text-2xl font-bold ${textColor}`}
                              >
                                {
                                  item.percentage
                                }
                                %
                              </p>

                              <p className="text-xs text-zinc-500">
                                {
                                  item.status
                                }
                              </p>
                            </div>
                          </div>

                          {/* BAR */}

                          <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{
                                width: `${Math.min(
                                  item.percentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          {/* FOOTER */}

                          <div className="flex items-center justify-between text-sm flex-wrap gap-3">
                            <p className="text-zinc-400">
                              Remaining:
                              {" "}
                              <span className="text-white font-semibold">
                                ₦
                                {item.remaining.toLocaleString()}
                              </span>
                            </p>

                            {item.pfos
                              ?.exceedsPFOS && (
                              <p className="text-red-400 text-xs">
                                Above PFOS
                                allocation
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}