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

                    <option value="EMERGENCY_FUND">
            Emergency Fund
          </option>

          <option value="DEBT_FREEDOM">
            Become Debt Free
          </option>

          <option value="HOME_OWNERSHIP">
            Home Ownership
          </option>

          <option value="BUSINESS_GROWTH">
            Business Growth
          </option>

          <option value="RETIREMENT">
            Retirement
          </option>

          <option value="INVESTMENT">
            Investment
          </option>

          <option value="WEALTH_BUILDING">
            Wealth Building
          </option>
        </select>
      </div>

            {/* Savings Goal */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Emergency Savings Goal
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

      {/* Interested in Investing */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Are you interested in investing?
        </label>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-white">
            <input
                            type="radio"
              value="true"
              {...register("interestedInInvesting", {
                setValueAs: (v) => v === "true",
              })}
            />
            Yes
          </label>

          <label className="flex items-center gap-2 text-sm text-white">
                        <input
              type="radio"
              value="false"
              {...register("interestedInInvesting", {
                setValueAs: (v) => v === "true",
              })}
            />
            No
          </label>
        </div>
      </div>
    </div>
  );
}