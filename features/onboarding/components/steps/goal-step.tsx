"use client";

import {
  UseFormRegister,
} from "react-hook-form";

import {
  OnboardingFormValues,
} from "../../schemas/onboarding-schema";

interface Props {
  register: UseFormRegister<OnboardingFormValues>;
}

export function GoalStep({
  register,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Main Financial Goal */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          What is your main financial goal?
        </label>

        <select
          {...register("financialGoal")}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
        >
          <option value="">
            Select financial goal
          </option>

          <option value="DEBT_FREE">
            Become Debt Free
          </option>

          <option value="BUILD_SAVINGS">
            Build Savings
          </option>

          <option value="EMERGENCY_FUND">
            Emergency Fund
          </option>

          <option value="RETIREMENT">
            Retirement
          </option>

          <option value="BUSINESS_CAPITAL">
            Business Capital
          </option>

          <option value="FINANCIAL_FREEDOM">
            Financial Freedom
          </option>
        </select>
      </div>

      {/* Savings Goal */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Target Savings Amount
        </label>

        <input
          type="number"
          placeholder="Enter target savings amount"
          {...register(
            "emergencySavingsGoal",
            {
              valueAsNumber: true,
            }
          )}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
        />
      </div>
    </div>
  );
}