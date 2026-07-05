import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type EntryType =
  | "INCOME"
  | "EXPENSE"
  | "INVESTMENT"
  | "DEBT_PAYMENT"
  | "TRANSFER";

import { AnalyticsClient } from "@/features/analytics/components/analytics-client";

import { ExportButton } from "@/features/analytics/components/export-button";

import { DateRangeFilter } from "@/features/analytics/components/date-range-filter";

import { ComparisonCards } from "@/features/analytics/components/comparison-cards";

import { DateRangeEngine } from "@/features/analytics/services/date-range-engine";

import { ComparativeEngine } from "@/features/analytics/services/comparative-engine";

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
    income: "INCOME",

    expenses: "EXPENSE",

    investments: "INVESTMENT",

    "debt-payment": "DEBT_PAYMENT",

    transfer: "TRANSFER",
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

    const entries = await db.entry.findMany({
    where: {
      userId: session.user.id,

      type: entryType,

      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });


  /*
   -----------------------------------
   FETCH PREVIOUS ENTRIES
   -----------------------------------
  */

    const previousEntries = await db.entry.findMany({
    where: {
      userId: session.user.id,

      type: entryType,

      createdAt: {
        gte: previousStart,
        lte: previousEnd,
      },
    },

    include: {
      category: true,
    },
  });

  const normalizedEntries = entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: entry.category?.name ?? "Uncategorized",
    amount: Number(entry.amount),
    createdAt: entry.createdAt,
  }));

  const normalizedPreviousEntries = previousEntries.map((entry) => ({
    amount: Number(entry.amount),
    createdAt: entry.createdAt,
  }));


  /*
   -----------------------------------
   COMPARATIVE ANALYTICS
   -----------------------------------
  */

    const currentTotal = ComparativeEngine.getCurrentTotal(normalizedEntries);

  const previousTotal = ComparativeEngine.getPreviousTotal(
    normalizedPreviousEntries
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
   DATE LABEL
   -----------------------------------
  */

  const dateLabel = `${
    dateRange.start.toLocaleDateString()
  } → ${dateRange.end.toLocaleDateString()}`;

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

                {/* ANALYTICS */}

                        <AnalyticsClient
                  entries={normalizedEntries}
                  type={type}
                />

      </div>
    </main>
  );
}