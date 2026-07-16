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
        <main className="mx-auto max-w-5xl space-y-6 lg:space-y-8 px-4 lg:px-6 py-6 lg:py-10 pt-16 lg:pt-10">

      {/* HEADER */}

      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            {userName} Blueprint
          </h1>

          <p className="mt-1 lg:mt-2 text-sm lg:text-base text-zinc-400">
            Your personal financial operating system
          </p>
        </div>

        <a
          href="/dashboard"
          className="rounded-xl bg-white px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-black hover:bg-zinc-200 transition-colors"
        >
          Dashboard
        </a>
      </section>

      {/* INCOME */}

      <section className="rounded-2xl lg:rounded-3xl border border-zinc-800 bg-zinc-950 p-5 lg:p-6">

        <h2 className="text-lg lg:text-xl font-semibold text-white">
          Income Snapshot
        </h2>

        <div className="mt-3 lg:mt-4 text-3xl lg:text-4xl font-bold text-white">
          {currencySymbol}
          {baseIncome.toLocaleString()}
        </div>

        <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-zinc-400">
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

      <section className="rounded-2xl lg:rounded-3xl border border-zinc-800 bg-zinc-950 p-5 lg:p-6">

        <h2 className="text-lg lg:text-xl font-semibold text-white">
          Financial Health
        </h2>

        <div className="mt-6 flex items-center gap-8">

          <div className="h-48 w-10 overflow-hidden rounded-full bg-zinc-800">

            <div
              className="w-full bg-green-500 transition-all duration-500"
              style={{
                height: `${health}%`,
              }}
            />

          </div>

          <div className="space-y-1">

            <div className="text-6xl font-bold text-white leading-none">
              {health}
            </div>

            <div className="text-base text-zinc-500">
              out of 100
            </div>

            <div className="text-sm text-zinc-400 mt-2">
              {health >= 80 ? "Excellent" : health >= 60 ? "Good" : health >= 40 ? "Fair" : "Needs attention"}
            </div>

          </div>

        </div>

      </section>

      {/* PFOS STRUCTURE */}

      <section className="rounded-2xl lg:rounded-3xl border border-zinc-800 bg-zinc-950 p-5 lg:p-6">

        <h2 className="mb-4 lg:mb-6 text-lg lg:text-xl font-semibold text-white">
          PFOS Structure
        </h2>

        <div className="overflow-x-auto -mx-5 lg:mx-0">
          <table className="w-full min-w-[400px] lg:min-w-0 px-5 lg:px-0">

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
        </div>

      </section>

      {/* LIVE ALLOCATIONS */}

      <section className="rounded-2xl lg:rounded-3xl border border-zinc-800 bg-zinc-950 p-5 lg:p-6">

        <h2 className="mb-4 lg:mb-6 text-lg lg:text-xl font-semibold text-white">
          Allocation Breakdown
        </h2>

        <div className="overflow-x-auto -mx-5 lg:mx-0">
          <table className="w-full min-w-[400px] lg:min-w-0 px-5 lg:px-0">

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
        </div>

      </section>

      {/* INSIGHTS */}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">

        <div className="rounded-2xl lg:rounded-3xl border border-zinc-800 bg-zinc-950 p-5 lg:p-6">

          <h3 className="font-semibold text-white">
            Emergency Reserve
          </h3>

          <p className="mt-3 text-xl lg:text-2xl font-bold text-white">

            {currencySymbol}
            {Number(
              blueprint.emergencyAllocation
            ).toLocaleString()}

          </p>

        </div>

        <div className="rounded-2xl lg:rounded-3xl border border-zinc-800 bg-zinc-950 p-5 lg:p-6">

          <h3 className="font-semibold text-white">
            Debt Priority
          </h3>

          <p className="mt-3 text-xl lg:text-2xl font-bold text-white">

            {profile.hasDebt
              ? "High"
              : "Cleared"}

          </p>

        </div>

        <div className="rounded-2xl lg:rounded-3xl border border-zinc-800 bg-zinc-950 p-5 lg:p-6">

          <h3 className="font-semibold text-white">
            Investment Readiness
          </h3>

          <p className="mt-3 text-xl lg:text-2xl font-bold text-white">

            {health >= 70
              ? "Ready"
              : "Building"}

          </p>

        </div>

      </section>

    </main>
  );
}