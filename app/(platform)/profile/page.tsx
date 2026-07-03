import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { getCurrencySymbol } from "@/lib/currency";

import { ProfileForm } from "@/app/(platform)/profile/profile-form";
import { ConnectFarcasterCard } from "@/features/farcaster/components/connect-farcaster-card";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const profile = await db.financialProfile.findUnique({
    where: { userId: user.id },
  });

  const blueprint = await db.financialBlueprint.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { version: "desc" },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  const currencySymbol = getCurrencySymbol(profile.currency);

  return (
    <main className="space-y-8">
      {/* HEADER */}

      <section>
        <h1 className="text-4xl font-bold text-white">Profile</h1>
        <p className="mt-2 text-zinc-400">
          Your personal financial profile used for PFOS calculations
        </p>
      </section>

      {/* OVERVIEW */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Overview</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Name</p>
            <p className="text-white font-medium">{profile.fullName}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Email</p>
            <p className="text-white font-medium">{user.email}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Employment</p>
            <p className="text-white font-medium capitalize">
              {profile.employmentType.replace(/_/g, " ").toLowerCase()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Marital Status</p>
            <p className="text-white font-medium capitalize">
              {profile.maritalStatus.toLowerCase()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Dependents</p>
            <p className="text-white font-medium">
              {profile.hasDependents ? profile.dependentsCount : "None"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Currency</p>
            <p className="text-white font-medium">
              {profile.currency} ({currencySymbol})
            </p>
          </div>
        </div>
      </section>

      {/* INCOME */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Income</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Monthly Income</p>
            <p className="text-white font-medium">
              {currencySymbol}
              {Number(profile.monthlyIncome).toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Additional Income</p>
            <p className="text-white font-medium">
              {Number(profile.additionalIncome ?? 0) > 0
                ? `${currencySymbol}${Number(profile.additionalIncome).toLocaleString()}`
                : "None recorded"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Frequency</p>
            <p className="text-white font-medium capitalize">
              {profile.incomeFrequency.replace(/_/g, " ").toLowerCase()}
            </p>
          </div>
        </div>
      </section>

      {/* DEBT */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Debt</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Has Debt</p>
            <p className="text-white font-medium">
              {profile.hasDebt ? "Yes" : "No"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Total Debt</p>
            <p className="text-white font-medium">
              {profile.totalDebt && Number(profile.totalDebt) > 0
                ? `${currencySymbol}${Number(profile.totalDebt).toLocaleString()}`
                : "—"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Monthly Repayment</p>
            <p className="text-white font-medium">
              {profile.repaymentAmount && Number(profile.repaymentAmount) > 0
                ? `${currencySymbol}${Number(profile.repaymentAmount).toLocaleString()}`
                : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* GOALS */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Goals</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Main Financial Goal</p>
            <p className="text-white font-medium capitalize">
              {profile.mainFinancialGoal.replace(/_/g, " ").toLowerCase()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Emergency Savings Goal</p>
            <p className="text-white font-medium">
              {profile.emergencySavingsGoal && Number(profile.emergencySavingsGoal) > 0
                ? `${currencySymbol}${Number(profile.emergencySavingsGoal).toLocaleString()}`
                : "Not set"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Interested in Investing</p>
            <p className="text-white font-medium">
              {profile.interestedInInvesting ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {blueprint && (
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-zinc-500">Financial Health Score</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {blueprint.financialHealthScore}
                  <span className="text-sm text-zinc-500 font-normal"> / 100</span>
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">Blueprint Mode</p>
                <p className="text-lg font-semibold text-white mt-1 capitalize">
                  {blueprint.blueprintMode.toLowerCase().replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FARCASTER CREATOR */}

      <ConnectFarcasterCard
        currencySymbol={currencySymbol}
        connection={
          profile.farcasterFid && profile.farcasterUsername
            ? {
                fid: profile.farcasterFid,
                username: profile.farcasterUsername,
                displayName: profile.farcasterDisplayName,
                pfpUrl: profile.farcasterPfpUrl,
                followers: profile.farcasterFollowers,
              }
            : null
        }
      />

      {/* EDIT FORM */}

      <ProfileForm
        userId={user.id}
        profile={{
          fullName: profile.fullName,
          employmentType: profile.employmentType,
          maritalStatus: profile.maritalStatus,
          hasDependents: profile.hasDependents,
          dependentsCount: profile.dependentsCount,
          currency: profile.currency,
          monthlyIncome: Number(profile.monthlyIncome),
          additionalIncome: Number(profile.additionalIncome ?? 0),
          incomeFrequency: profile.incomeFrequency,
          hasDebt: profile.hasDebt,
          totalDebt: Number(profile.totalDebt ?? 0),
          repaymentAmount: Number(profile.repaymentAmount ?? 0),
          mainFinancialGoal: profile.mainFinancialGoal,
          emergencySavingsGoal: Number(profile.emergencySavingsGoal ?? 0),
          interestedInInvesting: profile.interestedInInvesting,
        }}
      />
    </main>
  );
}
