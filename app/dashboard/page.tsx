import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { headers } from "next/headers";

import { EntryForm } from "@/features/entries/components/entry-form";

export default async function DashboardPage() {
  /*
   -----------------------------------
   GET SESSION
   -----------------------------------
  */

  const session = await auth.api.getSession({
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
   FETCH USER DATA
   -----------------------------------
  */

  const profile = await db.profile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  const blueprint =
    await db.pFOSBlueprint.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  /*
   -----------------------------------
   FETCH ENTRIES
   -----------------------------------
  */

  const entries = await db.entry.findMany({
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
   EMPTY STATE
   -----------------------------------
  */

  if (!profile || !blueprint) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">
            No Blueprint Found
          </h1>

          <p className="text-zinc-400">
            Complete onboarding first.
          </p>
        </div>
      </div>
    );
  }

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
            Finance OS
          </h1>

          <p className="text-zinc-400 text-lg">
            Welcome back{" "}
            {session.user.name || "User"}
          </p>
        </div>

        {/* FINANCIAL STAGE */}

        <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
          <p className="text-sm text-zinc-400">
            Financial Stage
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {profile.financialStage.replaceAll(
              "_",
              " "
            )}
          </h2>
        </div>

        {/* METRICS GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Savings Rate"
            value={`${blueprint.savingsRate}%`}
          />

          <MetricCard
            title="Debt Ratio"
            value={`${blueprint.debtToIncomeRatio}%`}
          />

          <MetricCard
            title="Liquidity Score"
            value={`${blueprint.liquidityScore}`}
          />

          <MetricCard
            title="Stability Score"
            value={`${blueprint.stabilityScore}`}
          />
        </div>

        {/* PFOS ALLOCATION */}

        <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-bold">
            PFOS Allocation Blueprint
          </h2>

          <AllocationBar
            label="Survival"
            value={
              blueprint.survivalAllocation
            }
          />

          <AllocationBar
            label="Debt"
            value={blueprint.debtAllocation}
          />

          <AllocationBar
            label="Emergency"
            value={
              blueprint.emergencyAllocation
            }
          />

          <AllocationBar
            label="Investment"
            value={
              blueprint.investmentAllocation
            }
          />

          <AllocationBar
            label="Lifestyle"
            value={
              blueprint.lifestyleAllocation
            }
          />
        </div>

        {/* ENTRY FORM */}

        <EntryForm />

        {/* RECENT ENTRIES */}

        <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Recent Transactions
            </h2>

            <p className="text-sm text-zinc-400">
              {entries.length} Entries
            </p>
          </div>

          <div className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-zinc-500">
                No entries yet.
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between border border-zinc-800 rounded-xl p-4"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {entry.title}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {entry.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">
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
              ))
            )}
          </div>
        </div>
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
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}

/*
 -----------------------------------
 ALLOCATION BAR
 -----------------------------------
*/

function AllocationBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="font-medium">
          {label}
        </span>

        <span>{value}%</span>
      </div>

      <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
        <div
          className="bg-white h-full"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}