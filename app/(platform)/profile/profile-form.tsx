"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateFinancialProfile } from "@/app/(platform)/profile/actions";

const EMPLOYMENT_TYPES = [
  "EMPLOYED",
  "SELF_EMPLOYED",
  "BUSINESS_OWNER",
  "FREELANCER",
  "STUDENT",
  "UNEMPLOYED",
  "RETIRED",
] as const;

const MARITAL_STATUSES = [
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
] as const;

const INCOME_FREQUENCIES = [
  "MONTHLY",
  "WEEKLY",
  "BI_WEEKLY",
  "QUARTERLY",
  "ANNUALLY",
] as const;

const FINANCIAL_GOALS = [
  "EMERGENCY_FUND",
  "DEBT_FREEDOM",
  "HOME_OWNERSHIP",
  "BUSINESS_GROWTH",
  "RETIREMENT",
  "INVESTMENT",
  "WEALTH_BUILDING",
] as const;

const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "CAD", label: "Canadian Dollar (CA$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "AED", label: "UAE Dirham (د.إ)" },
  { code: "ZAR", label: "South African Rand (R)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
  { code: "GHS", label: "Ghanaian Cedi (GH₵)" },
];

interface ProfileFormProps {
  userId: string;
  profile: {
    fullName: string;
    employmentType: string;
    maritalStatus: string;
    hasDependents: boolean;
    dependentsCount: number;
    currency: string;
    monthlyIncome: number;
    additionalIncome: number;
    incomeFrequency: string;
    hasDebt: boolean;
    totalDebt: number;
    repaymentAmount: number;
    mainFinancialGoal: string;
    emergencySavingsGoal: number;
    interestedInInvesting: boolean;
  };
}

export function ProfileForm({ userId, profile }: ProfileFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    formData.set("hasDependents", formData.has("hasDependents") ? "true" : "false");
    formData.set("hasDebt", formData.has("hasDebt") ? "true" : "false");
    formData.set("interestedInInvesting", formData.has("interestedInInvesting") ? "true" : "false");

    await updateFinancialProfile(formData);

    setIsOpen(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* TOGGLE BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-zinc-900 transition-colors text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-white">Edit Profile</h2>
          <p className="text-xs text-zinc-500 mt-1">Update your personal and financial details</p>
        </div>
        <svg
          className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* FORM (collapsible) */}
      {isOpen && (
        <div className="border-t border-zinc-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="userId" value={userId} />

            {/* FULL NAME */}
            <div>
              <label htmlFor="fullName" className="block text-sm text-zinc-400 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={profile.fullName}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            {/* EMPLOYMENT TYPE & MARITAL STATUS */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="employmentType" className="block text-sm text-zinc-400 mb-1">
                  Employment Type
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  defaultValue={profile.employmentType}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="maritalStatus" className="block text-sm text-zinc-400 mb-1">
                  Marital Status
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  defaultValue={profile.maritalStatus}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                >
                  {MARITAL_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

        {/* DEPENDENTS */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="hasDependents"
                  defaultChecked={profile.hasDependents}
                  className="h-5 w-5 rounded border-zinc-800 bg-black text-white focus:ring-white"
                />
                <span className="text-sm text-zinc-400">Has Dependents</span>
              </label>

              <div>
                <label htmlFor="dependentsCount" className="block text-sm text-zinc-400 mb-1">
                  Number of Dependents
                </label>
                <input
                  id="dependentsCount"
                  name="dependentsCount"
                  type="number"
                  min={0}
                  defaultValue={profile.dependentsCount}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* CURRENCY */}
            <div>
              <label htmlFor="currency" className="block text-sm text-zinc-400 mb-1">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={profile.currency}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* INCOME */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="monthlyIncome" className="block text-sm text-zinc-400 mb-1">
                  Monthly Income
                </label>
                <input
                  id="monthlyIncome"
                  name="monthlyIncome"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={profile.monthlyIncome}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label htmlFor="additionalIncome" className="block text-sm text-zinc-400 mb-1">
                  Additional Income
                </label>
                <input
                  id="additionalIncome"
                  name="additionalIncome"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={profile.additionalIncome}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label htmlFor="incomeFrequency" className="block text-sm text-zinc-400 mb-1">
                  Income Frequency
                </label>
                <select
                  id="incomeFrequency"
                  name="incomeFrequency"
                  defaultValue={profile.incomeFrequency}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                >
                  {INCOME_FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DEBT */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="hasDebt"
                  defaultChecked={profile.hasDebt}
                  className="h-5 w-5 rounded border-zinc-800 bg-black text-white focus:ring-white"
                />
                <span className="text-sm text-zinc-400">Has Debt</span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="totalDebt" className="block text-sm text-zinc-400 mb-1">
                    Total Debt
                  </label>
                  <input
                    id="totalDebt"
                    name="totalDebt"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={profile.totalDebt}
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label htmlFor="repaymentAmount" className="block text-sm text-zinc-400 mb-1">
                    Monthly Repayment
                  </label>
                  <input
                    id="repaymentAmount"
                    name="repaymentAmount"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={profile.repaymentAmount}
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="debtDueDate" className="block text-sm text-zinc-400 mb-1">
                  Due Date for Full Repayment
                </label>
                <input
                  id="debtDueDate"
                  name="debtDueDate"
                  type="date"
                  defaultValue={(profile as any).debtDueDate || ""}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* GOALS */}
            <div>
              <label htmlFor="mainFinancialGoal" className="block text-sm text-zinc-400 mb-1">
                Main Financial Goal
              </label>
              <select
                id="mainFinancialGoal"
                name="mainFinancialGoal"
                defaultValue={profile.mainFinancialGoal}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
              >
                {FINANCIAL_GOALS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="emergencySavingsGoal" className="block text-sm text-zinc-400 mb-1">
                  Emergency Savings Goal
                </label>
                <input
                  id="emergencySavingsGoal"
                  name="emergencySavingsGoal"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={profile.emergencySavingsGoal}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-end pb-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="interestedInInvesting"
                    defaultChecked={profile.interestedInInvesting}
                    className="h-5 w-5 rounded border-zinc-800 bg-black text-white focus:ring-white"
                  />
                  <span className="text-sm text-zinc-400">Interested in Investing</span>
                </label>
              </div>
            </div>

            {/* SUBMIT */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-zinc-800 px-6 py-3 font-medium text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
