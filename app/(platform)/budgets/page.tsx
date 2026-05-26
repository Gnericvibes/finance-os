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

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div>
          <h1 className="text-5xl font-bold">
            Budgets
          </h1>

          <p className="text-zinc-400 mt-2">
            Monthly allocation and
            spending intelligence
          </p>
        </div>

        {/* BUDGETS */}

        <div className="space-y-8">
          {budgets.length === 0 ? (
            <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-10 text-center">
              <p className="text-zinc-500">
                No budgets created yet.
              </p>
            </div>
          ) : (
            budgets.map((budget) => {
              const analysis =
                BudgetEngine.analyzeBudget(
                  budget.categories,
                  entries
                );

              return (
                <div
                  key={budget.id}
                  className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-6"
                >
                  <div>
                    <h2 className="text-3xl font-bold">
                      {budget.name}
                    </h2>

                    <p className="text-zinc-400 mt-1">
                      {budget.month}/
                      {budget.year}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {analysis.map(
                      (item) => (
                        <div
                          key={
                            item.category
                          }
                          className="space-y-2"
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">
                                {
                                  item.category
                                }
                              </p>

                              <p className="text-sm text-zinc-400">
                                ₦
                                {item.spent.toLocaleString()}
                                {" / "}
                                ₦
                                {item.limit.toLocaleString()}
                              </p>
                            </div>

                            <div className="text-right">
                              <p
                                className={`font-bold ${
                                  item.status ===
                                  "OVER_BUDGET"
                                    ? "text-red-400"
                                    : item.status ===
                                      "WARNING"
                                    ? "text-yellow-400"
                                    : "text-green-400"
                                }`}
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

                          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.status ===
                                "OVER_BUDGET"
                                  ? "bg-red-500"
                                  : item.status ===
                                    "WARNING"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  item.percentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}