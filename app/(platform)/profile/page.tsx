import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";
import { getCurrencySymbol } from "@/lib/currency";
import { loadUserFinancialData } from "@/lib/load-user-financial-data";

import { ProfileForm } from "@/app/(platform)/profile/profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { profile, blueprint } = await loadUserFinancialData(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const currencySymbol = getCurrencySymbol(profile.currency);

  // Compute estimated debt-free date
  const now = new Date();
  let estimatedDebtFree: Date | null = null;
  let monthsToPayOff: number | null = null;

  if (
    profile.hasDebt &&
    profile.totalDebt &&
    Number(profile.totalDebt) > 0 &&
    profile.repaymentAmount &&
    Number(profile.repaymentAmount) > 0
  ) {
    monthsToPayOff = Math.ceil(Number(profile.totalDebt) / Number(profile.repaymentAmount));
    estimatedDebtFree = new Date(now);
    estimatedDebtFree.setMonth(estimatedDebtFree.getMonth() + monthsToPayOff);
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            <p className="text-sm text-zinc-500 mt-1">Your personal financial profile</p>
          </div>
        </div>

        {/* PERSONAL DETAILS */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="p-6">
            <h2 className="text-base font-semibold text-white mb-5">Personal Details</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Name</p>
                <p className="text-sm text-white font-medium mt-1">{profile.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
                <p className="text-sm text-white font-medium mt-1 truncate">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Employment</p>
                <p className="text-sm text-white font-medium mt-1 capitalize">
                  {profile.employmentType.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Marital Status</p>
                <p className="text-sm text-white font-medium mt-1 capitalize">
                  {profile.maritalStatus.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FINANCIAL OVERVIEW */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="p-6">
            <h2 className="text-base font-semibold text-white mb-5">Financial Overview</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Monthly Income</p>
                <p className="text-lg font-semibold text-white mt-1">
                  {currencySymbol}{Number(profile.monthlyIncome).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Additional Income</p>
                <p className="text-sm text-white font-medium mt-1">
                  {Number(profile.additionalIncome ?? 0) > 0
                    ? `${currencySymbol}${Number(profile.additionalIncome).toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Frequency</p>
                <p className="text-sm text-white font-medium mt-1 capitalize">
                  {profile.incomeFrequency.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Dependents</p>
                <p className="text-sm text-white font-medium mt-1">
                  {profile.hasDependents ? profile.dependentsCount : "None"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Currency</p>
                <p className="text-sm text-white font-medium mt-1">
                  {profile.currency} ({currencySymbol})
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Interested in Investing</p>
                <p className="text-sm text-white font-medium mt-1">
                  {profile.interestedInInvesting ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DEBT & GOALS SIDE BY SIDE */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DEBT */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-base font-semibold text-white mb-5">Debt</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Status</p>
                <p className="text-sm text-white font-medium mt-1">
                  {profile.hasDebt ? "Active" : "Debt Free"}
                </p>
              </div>
              {profile.hasDebt && (
                <>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Debt</p>
                    <p className="text-lg font-semibold text-white mt-1">
                      {profile.totalDebt && Number(profile.totalDebt) > 0
                        ? `${currencySymbol}${Number(profile.totalDebt).toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Monthly Repayment</p>
                    <p className="text-sm text-white font-medium mt-1">
                      {profile.repaymentAmount && Number(profile.repaymentAmount) > 0
                        ? `${currencySymbol}${Number(profile.repaymentAmount).toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                  {profile.debtDueDate && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Due Date</p>
                      <p className="text-sm text-white font-medium mt-1">
                        {formatDate(new Date(profile.debtDueDate))}
                      </p>
                    </div>
                  )}
                  {estimatedDebtFree && monthsToPayOff !== null && !profile.debtDueDate && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">
                        Estimated Payoff
                      </p>
                      <p className="text-sm text-white font-medium mt-1">
                        {formatDate(estimatedDebtFree)}
                        <span className="text-xs text-zinc-500 ml-2">
                          ({monthsToPayOff} months)
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* GOALS & HEALTH */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-base font-semibold text-white mb-5">Goals & Health</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Main Goal</p>
                <p className="text-sm text-white font-medium mt-1 capitalize">
                  {profile.mainFinancialGoal.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Emergency Fund Target</p>
                <p className="text-sm text-white font-medium mt-1">
                  {profile.emergencySavingsGoal && Number(profile.emergencySavingsGoal) > 0
                    ? `${currencySymbol}${Number(profile.emergencySavingsGoal).toLocaleString()}`
                    : "Not set"}
                </p>
              </div>
              {blueprint && (
                <>
                  <div className="pt-3 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Financial Health Score</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-2xl font-bold text-white">{blueprint.financialHealthScore}</p>
                      <span className="text-xs text-zinc-500">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Blueprint Mode</p>
                    <p className="text-sm text-white font-medium mt-1 capitalize">
                      {blueprint.blueprintMode.toLowerCase().replace(/_/g, " ")}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* EDIT PROFILE (inline toggle) */}

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
            debtDueDate: profile.debtDueDate ? new Date(profile.debtDueDate).toISOString().split("T")[0] : "",
            mainFinancialGoal: profile.mainFinancialGoal,
            emergencySavingsGoal: Number(profile.emergencySavingsGoal ?? 0),
            interestedInInvesting: profile.interestedInInvesting,
          }}
        />
      </div>
    </main>
  );
}
