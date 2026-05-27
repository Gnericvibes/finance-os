import { redirect } from "next/navigation";

import { headers } from "next/headers";

import Link from "next/link";

import { auth } from "@/lib/auth";

import { db } from "@/lib/db";

import { EntryType } from "@prisma/client";

import { AnalyticsClient } from "@/features/analytics/components/analytics-client";

import { ExportButton } from "@/features/analytics/components/export-button";

import { DateRangeFilter } from "@/features/analytics/components/date-range-filter";

import { ComparisonCards } from "@/features/analytics/components/comparison-cards";

import { DateRangeEngine } from "@/features/analytics/services/date-range-engine";

import { ComparativeEngine } from "@/features/analytics/services/comparative-engine";

import { IntelligenceEngine } from "@/features/intelligence/services/intelligence-engine";

import { AIInsights } from "@/features/intelligence/components/ai-insights";

import { PredictiveEngine } from "@/features/intelligence/services/predictive-engine";

import { PredictiveDashboard } from "@/features/intelligence/components/predictive-dashboard";

interface AnalyticsPageProps {
  params: Promise<{
    type: string;
  }>;

  searchParams: Promise<{
    from?: string;

    to?: string;
  }>;
}

export default async function AnalyticsPage({
  params,
  searchParams,
}: AnalyticsPageProps) {
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
   PARAMS
   -----------------------------------
  */

  const { type } =
    await params;

  const {
    from,
    to,
  } = await searchParams;

  /*
   -----------------------------------
   DATE RANGE
   -----------------------------------
  */

  const dateRange =
    DateRangeEngine.parseCustomRange(
      from,
      to
    );

  /*
   -----------------------------------
   PREVIOUS RANGE
   -----------------------------------
  */

  const diff =
    dateRange.end.getTime() -
    dateRange.start.getTime();

  const previousStart =
    new Date(
      dateRange.start.getTime() -
        diff
    );

  const previousEnd =
    new Date(
      dateRange.end.getTime() -
        diff
    );

  /*
   -----------------------------------
   TYPE MAP
   -----------------------------------
  */

  const typeMap: Record<
    string,
    EntryType
  > = {
    income:
      EntryType.INCOME,

    expenses:
      EntryType.EXPENSE,

    investments:
      EntryType.INVESTMENT,

    "debt-payment":
      EntryType.DEBT_PAYMENT,

    transfer:
      EntryType.TRANSFER,
  };

  const entryType =
    typeMap[type];

  if (!entryType) {
    redirect("/dashboard");
  }

  /*
   -----------------------------------
   DESCRIPTION MAP
   -----------------------------------
  */

  const descriptionMap: Record<
    string,
    string
  > = {
    income:
      "Income performance and earnings intelligence",

    expenses:
      "Spending trends and category intelligence",

    investments:
      "Investment growth and capital allocation insights",

    "debt-payment":
      "Debt reduction and repayment tracking",

    transfer:
      "Cash movement and transfer monitoring",
  };

  /*
   -----------------------------------
   FETCH CURRENT ENTRIES
   -----------------------------------
  */

  const entries =
    await db.entry.findMany({
      where: {
        userId:
          session.user.id,

        type: entryType,

        createdAt: {
          gte:
            dateRange.start,

          lte:
            dateRange.end,
        },
      },

      orderBy: {
        createdAt:
          "desc",
      },
    });

  /*
   -----------------------------------
   FETCH PREVIOUS ENTRIES
   -----------------------------------
  */

  const previousEntries =
    await db.entry.findMany({
      where: {
        userId:
          session.user.id,

        type: entryType,

        createdAt: {
          gte:
            previousStart,

          lte:
            previousEnd,
        },
      },
    });

  /*
   -----------------------------------
   COMPARATIVE ANALYTICS
   -----------------------------------
  */

  const currentTotal =
    ComparativeEngine.getCurrentTotal(
      entries
    );

  const previousTotal =
    ComparativeEngine.getPreviousTotal(
      previousEntries
    );

  const percentageChange =
    ComparativeEngine.getPercentageChange(
      currentTotal,
      previousTotal
    );

  const trend =
    ComparativeEngine.getTrend(
      percentageChange
    );

  /*
   -----------------------------------
   AI INSIGHTS
   -----------------------------------
  */

  const insights =
    IntelligenceEngine.generateInsights(
      {
        entries,

        currentTotal,

        previousTotal,
      }
    );

  /*
   -----------------------------------
   PREDICTIVE INTELLIGENCE
   -----------------------------------
  */

  const projectedSpending =
    PredictiveEngine.projectMonthlySpending(
      entries
    );

  const forecastSavings =
    PredictiveEngine.forecastSavings(
      currentTotal,
      projectedSpending
    );

  const burnRate =
    PredictiveEngine.calculateBurnRate(
      projectedSpending
    );

  const runway =
    PredictiveEngine.calculateRunway(
      currentTotal,
      burnRate
    );

  const healthScore =
    PredictiveEngine.calculateHealthScore(
      {
        income:
          currentTotal,

        expenses:
          projectedSpending,

        savings:
          forecastSavings,
      }
    );

  const healthLabel =
    PredictiveEngine.getHealthLabel(
      healthScore
    );

  const investmentProjection =
    PredictiveEngine.projectInvestmentGrowth(
      {
        principal:
          currentTotal,

        monthlyContribution:
          50000,

        annualRate: 12,

        years: 5,
      }
    );

  /*
   -----------------------------------
   TOTAL
   -----------------------------------
  */

  const total =
    entries.reduce(
      (acc, entry) =>
        acc + entry.amount,
      0
    );

  /*
   -----------------------------------
   UNIQUE CATEGORIES
   -----------------------------------
  */

  const categories = [
    ...new Set(
      entries.map(
        (entry) =>
          entry.category
      )
    ),
  ];

  /*
   -----------------------------------
   DATE LABEL
   -----------------------------------
  */

  const dateLabel = `${
    dateRange.start.toLocaleDateString()
  } → ${dateRange.end.toLocaleDateString()}`;

  /*
   -----------------------------------
   CHART DATA
   -----------------------------------
  */

  let chartData: {
    name: string;
    value: number;
  }[] = [];

  /*
   -----------------------------------
   EXPENSES
   CATEGORY DISTRIBUTION
   -----------------------------------
  */

  if (type === "expenses") {
    const categoryMap =
      new Map<
        string,
        number
      >();

    entries.forEach(
      (entry) => {
        const current =
          categoryMap.get(
            entry.category
          ) || 0;

        categoryMap.set(
          entry.category,
          current +
            entry.amount
        );
      }
    );

    chartData =
      Array.from(
        categoryMap.entries()
      ).map(
        ([
          category,
          amount,
        ]) => ({
          name: category,
          value: amount,
        })
      );
  }

  /*
   -----------------------------------
   OTHER TYPES
   TIMELINE TREND
   -----------------------------------
  */

  else {
    const groupedMap =
      new Map<
        string,
        number
      >();

    entries.forEach(
      (entry) => {
        const date =
          new Date(
            entry.createdAt
          ).toLocaleDateString();

        const current =
          groupedMap.get(
            date
          ) || 0;

        groupedMap.set(
          date,
          current +
            entry.amount
        );
      }
    );

    chartData =
      Array.from(
        groupedMap.entries()
      ).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
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

        <div className="space-y-6">
          <Link
            href="/dashboard"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-zinc-400
              hover:text-white
              transition
            "
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold capitalize">
                {type.replace(
                  "-",
                  " "
                )}
              </h1>

              <p className="text-zinc-400 mt-2">
                {
                  descriptionMap[
                    type
                  ]
                }
              </p>

              <p className="text-sm text-zinc-500 mt-3">
                {dateLabel}
              </p>
            </div>

            {/* EXPORT */}

            <ExportButton
              type={type}
            />
          </div>
        </div>

        {/* DATE FILTER */}

        <DateRangeFilter
          currentType={type}
        />

        {/* COMPARISON */}

        <ComparisonCards
          current={
            currentTotal
          }
          previous={
            previousTotal
          }
          percentage={
            percentageChange
          }
          trend={trend}
        />

        {/* AI INSIGHTS */}

        <AIInsights
          insights={insights}
        />

        {/* PREDICTIVE DASHBOARD */}

        <PredictiveDashboard
          projectedSpending={
            projectedSpending
          }
          forecastSavings={
            forecastSavings
          }
          burnRate={burnRate}
          runway={runway}
          healthScore={
            healthScore
          }
          healthLabel={
            healthLabel
          }
          investmentProjection={
            investmentProjection
          }
        />

        {/* SUMMARY */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
            <p className="text-zinc-400 text-sm">
              Total Volume
            </p>

            <h2 className="text-4xl font-bold mt-3">
              ₦
              {total.toLocaleString()}
            </h2>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
            <p className="text-zinc-400 text-sm">
              Transactions
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {
                entries.length
              }
            </h2>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
            <p className="text-zinc-400 text-sm">
              Categories
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {
                categories.length
              }
            </h2>
          </div>
        </div>

        {/* ANALYTICS */}

        <AnalyticsClient
          entries={entries}
          type={type}
        />
      </div>
    </main>
  );
}