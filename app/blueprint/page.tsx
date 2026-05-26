import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function BlueprintPage() {
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
   FETCH DATA
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
   EMPTY STATE
   -----------------------------------
  */

  if (!profile || !blueprint) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            No Blueprint Found
          </h1>

          <p className="text-zinc-400">
            Complete onboarding first.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="space-y-3">
          <h1 className="text-5xl font-bold">
            Financial Blueprint
          </h1>

          <p className="text-zinc-400 text-lg">
            Your strategic financial operating
            system
          </p>
        </div>

        {/* FINANCIAL STAGE */}

        <section className="border border-zinc-800 bg-zinc-950 rounded-3xl p-8">
          <p className="text-sm text-zinc-400 uppercase tracking-wider">
            Financial Stage
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {profile.financialStage.replaceAll(
              "_",
              " "
            )}
          </h2>
        </section>

        {/* SCORE GRID */}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </section>

        {/* PFOS SYSTEM */}

        <section className="border border-zinc-800 bg-zinc-950 rounded-3xl p-8 space-y-8">
          <div>
            <h2 className="text-3xl font-bold">
              PFOS Allocation System
            </h2>

            <p className="text-zinc-400 mt-2">
              Your personalized financial
              resource distribution framework
            </p>
          </div>

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
        </section>

        {/* STRATEGIC INSIGHTS */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightCard
            title="Financial Pressure"
            value={`${blueprint.pressureScore}/100`}
            description="Measures immediate financial stress based on obligations and cash flow."
          />

          <InsightCard
            title="System Stability"
            value={`${blueprint.stabilityScore}/100`}
            description="Represents long-term resilience and structural financial health."
          />
        </section>
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

      <h3 className="text-4xl font-bold mt-3">
        {value}
      </h3>
    </div>
  );
}

/*
 -----------------------------------
 INSIGHT CARD
 -----------------------------------
*/

function InsightCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">
          {title}
        </h3>

        <span className="text-2xl font-bold">
          {value}
        </span>
      </div>

      <p className="text-zinc-400 leading-relaxed">
        {description}
      </p>
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
  const colors: Record<
    string,
    string
  > = {
    Survival: "bg-red-500",
    Debt: "bg-orange-500",
    Emergency: "bg-yellow-500",
    Investment: "bg-green-500",
    Lifestyle: "bg-blue-500",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-lg">
          {label}
        </span>

        <span className="text-zinc-300">
          {value}%
        </span>
      </div>

      <div className="w-full h-5 bg-zinc-900 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            colors[label]
          }`}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}