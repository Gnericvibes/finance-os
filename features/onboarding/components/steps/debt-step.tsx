"use client";

import {
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";

import {
  OnboardingFormValues,
} from "../../schemas/onboarding-schema";

interface Props {
  register: UseFormRegister<OnboardingFormValues>;
  watch: UseFormWatch<OnboardingFormValues>;
}

export function DebtStep({
  register,
  watch,
}: Props) {
  const hasDebt = watch("hasDebt");

  return (
    <div className="space-y-6">
      {/* Has Debt */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Do you currently have any debt?
        </label>

        <select
          {...register("hasDebt")}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
        >
          <option value="">
            Select an option
          </option>

          <option value="true">
            Yes
          </option>

          <option value="false">
            No
          </option>
        </select>
      </div>

      {/* Debt Fields */}
      {hasDebt === "true" && (
        <>
          {/* Debt Amount */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              Total Debt Amount
            </label>

            <input
              type="number"
              placeholder="Enter debt amount"
              {...register("totalDebt", {
                valueAsNumber: true,
              })}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              Debt Due Date
            </label>

            <input
              type="date"
              {...register("debtDueDate")}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
            />
          </div>

          {/* Repayment Schedule */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              Repayment Schedule
            </label>

            <select
              {...register("repaymentSchedule")}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
            >
              <option value="">
                Select repayment schedule
              </option>

              <option value="DAILY">
                Daily
              </option>

              <option value="WEEKLY">
                Weekly
              </option>

              <option value="MONTHLY">
                Monthly
              </option>

              <option value="YEARLY">
                Yearly
              </option>
            </select>
          </div>

          {/* Repayment Amount */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              Repayment Amount
            </label>

            <input
              type="number"
              placeholder="Enter repayment amount"
              {...register("repaymentAmount", {
                valueAsNumber: true,
              })}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
            />
          </div>
        </>
      )}
    </div>
  );
}