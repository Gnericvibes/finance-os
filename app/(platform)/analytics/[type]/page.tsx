import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { AnalyticsEngine } from "@/features/analytics/services/analytics-engine";

import { AnalyticsChart } from "@/features/analytics/components/analytics-chart";

import { TransactionsTable } from "@/features/analytics/components/transactions-table";

import { AIInsightCard } from "@/features/analytics/components/ai-insight-card";

interface AnalyticsPageProps {
  params: Promise<{
    type: string;
  }>;
}

export default async function AnalyticsPage({
  params,
}: AnalyticsPageProps) {
  /*
   -----------------------------------
   PARAMS
   -----------------------------------
  */

  const resolvedParams =
    await params;

  const type =
    resolvedParams.type
      .toUpperCase();

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
   FETCH ENTRIES
   -----------------------------------
  */

  const entries =
    await db.entry.findMany({
      where: {
        userId: session.user.id,

        type: type as any,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  /*
   -----------------------------------
   ANALYTICS
   -----------------------------------
  */

  const total =
    AnalyticsEngine.getTotal(
      entries
    );

  const average =
    AnalyticsEngine.getAverageTransaction(
      entries
    );

  const largest =
    AnalyticsEngine.getLargestTransactions(
      entries
    );

  const categoryBreakdown =
    AnalyticsEngine.getCategoryBreakdown(
      entries
    );

  const trend =
    AnalyticsEngine.getMonthlyTrend(
      entries
    );

  /*
   -----------------------------------
   AI INSIGHT
   -----------------------------------
  */

  let insight =
    "Financial activity appears stable.";

  if (total > 500000) {
    insight =
      "High transaction volume detected. Monitor allocation efficiency and maintain liquidity discipline.";
  }

  if (entries.length === 0) {
    insight =
      "No financial records available yet for this category.";
  }

  /*
   -----------------------------------
   UI
   -----------------------------------
  */

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="space-y-2">
          <h1 className="text-5xl font-bold">
            {type.replaceAll(
              "_",
              " "
            )}{" "}
            Analytics
          </h1>

          <p className="text-zinc-400 text-lg">
            Deep financial
            intelligence dashboard
          </p>
        </div>

        {/* METRICS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total"
            value={`₦${total.toLocaleString()}`}
          />

          <MetricCard
            title="Average"
            value={`₦${average.toLocaleString()}`}
          />

          <MetricCard
            title="Transactions"
            value={`${entries.length}`}
          />
        </div>

        {/* AI INSIGHT */}

        <AIInsightCard
          insight={insight}
        />

        {/* CHART */}

        <AnalyticsChart
          data={trend}
        />

        {/* CATEGORY BREAKDOWN */}

        <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Category Breakdown
            </h2>

            <p className="text-zinc-400 text-sm">
              Allocation analysis
            </p>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map(
              (item) => (
                <div
                  key={
                    item.category
                  }
                  className="flex items-center justify-between border border-zinc-800 rounded-2xl p-4"
                >
                  <p className="font-semibold text-white capitalize">
                    {
                      item.category
                    }
                  </p>

                  <p className="font-bold text-white">
                    ₦
                    {item.amount.toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* LARGEST TRANSACTIONS */}

        <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Largest Transactions
            </h2>

            <p className="text-zinc-400 text-sm">
              Top 5
            </p>
          </div>

          <div className="space-y-4">
            {largest.map(
              (entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between border border-zinc-800 rounded-2xl p-4"
                >
                  <div>
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

                  <p className="font-bold text-white">
                    ₦
                    {entry.amount.toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* TABLE */}

        <TransactionsTable
          entries={entries}
        />
      </div>
    </main>
  );
}

/*
 -----------------------------------
 METRIC CARD
 -----------------------------------
*/

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-3 text-white">
        {value}
      </h3>
    </div>
  );
}