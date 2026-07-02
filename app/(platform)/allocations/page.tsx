import { redirect } from "next/navigation";



import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { ensureMonthlySnapshot } from "@/lib/ensure-monthly-snapshot";
import { getCurrencySymbol } from "@/lib/currency";

export default async function AllocationsPage() {
  const user =
    await getCurrentUser();

    if (!user) {
    redirect("/sign-in");
  }

  await ensureMonthlySnapshot(user.id);

  /*
    LOAD PROFILE
  */

  const profile =
    await db.financialProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

  /*
    LOAD BLUEPRINT
  */

    const blueprint = await db.financialBlueprint.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: {
      version: "desc",
    },
  });

  /*
    IF NO ONBOARDING
  */

  if (
    !profile ||
    !blueprint
  ) {
    redirect("/onboarding");
  }

  /*
    SAFE VALUES
  */

  const userName =
    user.name || "User";

  const baseIncome =
    Number(
      profile.monthlyIncome || 0
    );

  const additionalIncome =
    Number(
      profile.additionalIncome || 0
    );

  const health =
    Number(
      blueprint.financialHealthScore || 0
    );

  const currencySymbol = getCurrencySymbol(profile.currency);

  return (
    <main className="space-y-8">

      {/* HEADER */}

      <section>
        <h1 className="text-4xl font-bold text-white">
          {userName} Blueprint
        </h1>

        <p className="mt-2 text-zinc-400">
          Your personal financial operating system
        </p>
      </section>

      {/* INCOME */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

        <h2 className="text-xl font-semibold text-white">
          Income Snapshot
        </h2>

        <div className="mt-4 text-4xl font-bold text-white">
          {currencySymbol}
          {baseIncome.toLocaleString()}
        </div>

        <p className="mt-2 text-sm text-zinc-400">
          Monthly income used for PFOS calculations
        </p>

        {additionalIncome > 0 && (
          <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">

            <p className="font-medium text-green-400">
              +{currencySymbol}
              {additionalIncome.toLocaleString()}{" "}
              additional income recorded
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Additional income is tracked separately and does not change your PFOS baseline until your income profile is updated.
            </p>

          </div>
        )}

      </section>

      {/* FINANCIAL HEALTH */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

        <h2 className="text-xl font-semibold text-white">
          Financial Health
        </h2>

        <div className="mt-6 flex items-center gap-6">

          <div className="h-40 w-8 overflow-hidden rounded-full bg-zinc-800">

            <div
              className="w-full bg-green-500"
              style={{
                height: `${health}%`,
              }}
            />

          </div>

          <div>

            <div className="text-5xl font-bold text-white">
              {health}
            </div>

            <div className="text-zinc-400">
              out of 100
            </div>

          </div>

        </div>

      </section>

      {/* PFOS STRUCTURE */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

        <h2 className="mb-6 text-xl font-semibold text-white">
          PFOS Structure
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b border-zinc-800 text-zinc-400">

              <th className="pb-3 text-left">
                Category
              </th>

              <th className="pb-3 text-left">
                Allocation
              </th>

              <th className="pb-3 text-left">
                Purpose
              </th>

            </tr>

          </thead>

          <tbody className="text-white">

            <tr className="border-b border-zinc-900">

              <td className="py-4">
                Operations
              </td>

              <td>
                {blueprint.operationalPercentage}%
              </td>

              <td>
                Living expenses and lifestyle
              </td>

            </tr>

            <tr className="border-b border-zinc-900">

              <td className="py-4">
                Debt Elimination
              </td>

              <td>
                {blueprint.debtPercentage}%
              </td>

              <td>
                Remove financial drag
              </td>

            </tr>

            <tr className="border-b border-zinc-900">

              <td className="py-4">
                Investing
              </td>

              <td>
                {blueprint.investmentPercentage}%
              </td>

              <td>
                Pay yourself first
              </td>

            </tr>

            <tr>

              <td className="py-4">
                Emergency Reserve
              </td>

              <td>
                {blueprint.emergencyPercentage}%
              </td>

              <td>
                Financial security buffer
              </td>

            </tr>

          </tbody>

        </table>

      </section>

      {/* LIVE ALLOCATIONS */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

        <h2 className="mb-6 text-xl font-semibold text-white">
          Allocation Breakdown
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b border-zinc-800 text-zinc-400">

              <th className="pb-3 text-left">
                Category
              </th>

              <th className="pb-3 text-left">
                %
              </th>

              <th className="pb-3 text-left">
                Amount
              </th>

            </tr>

          </thead>

          <tbody className="text-white">

            <tr className="border-b border-zinc-900">

              <td className="py-4">
                Operations
              </td>

              <td>
                {blueprint.operationalPercentage}%
              </td>

              <td>
                {currencySymbol}
                {Number(
                  blueprint.operationalAllocation
                ).toLocaleString()}
              </td>

            </tr>

            <tr className="border-b border-zinc-900">

              <td className="py-4">
                Debt
              </td>

              <td>
                {blueprint.debtPercentage}%
              </td>

              <td>
                {currencySymbol}
                {Number(
                  blueprint.debtAllocation
                ).toLocaleString()}
              </td>

            </tr>

            <tr className="border-b border-zinc-900">

              <td className="py-4">
                Investing
              </td>

              <td>
                {blueprint.investmentPercentage}%
              </td>

              <td>
                {currencySymbol}
                {Number(
                  blueprint.investmentAllocation
                ).toLocaleString()}
              </td>

            </tr>

            <tr>

              <td className="py-4">
                Emergency Reserve
              </td>

              <td>
                {blueprint.emergencyPercentage}%
              </td>

              <td>
                {currencySymbol}
                {Number(
                  blueprint.emergencyAllocation
                ).toLocaleString()}
              </td>

            </tr>

          </tbody>

        </table>

      </section>

      {/* INSIGHTS */}

      <section className="grid gap-4 md:grid-cols-3">

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

          <h3 className="font-semibold text-white">
            Emergency Reserve
          </h3>

          <p className="mt-3 text-2xl font-bold text-white">

            {currencySymbol}
            {Number(
              blueprint.emergencyAllocation
            ).toLocaleString()}

          </p>

        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

          <h3 className="font-semibold text-white">
            Debt Priority
          </h3>

          <p className="mt-3 text-2xl font-bold text-white">

            {profile.hasDebt
              ? "High"
              : "Cleared"}

          </p>

        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

          <h3 className="font-semibold text-white">
            Investment Readiness
          </h3>

          <p className="mt-3 text-2xl font-bold text-white">

            {health >= 70
              ? "Ready"
              : "Building"}

          </p>

        </div>

      </section>

    </main>
  );
}