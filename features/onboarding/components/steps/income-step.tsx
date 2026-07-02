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

export function IncomeStep({
  register,
}: Props) {
  return (
    <div className="space-y-6">
      <input
        type="number"
        {...register(
          "mainMonthlyIncome",
          {
            valueAsNumber: true,
          }
        )}
        placeholder="Monthly Income"
        className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800"
      />

      <input
        type="number"
        {...register(
          "additionalIncome",
          {
            valueAsNumber: true,
          }
        )}
        placeholder="Additional Income"
        className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800"
      />

          <select
  {...register(
    "incomeFrequency"
  )}
  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white"
>
  <option value="">
    Select Income Frequency
  </option>

  <option value="MONTHLY">
    Monthly
  </option>

  <option value="WEEKLY">
    Weekly
  </option>

  <option value="BI_WEEKLY">
    Bi-Weekly
  </option>

  <option value="QUARTERLY">
    Quarterly
  </option>

  <option value="ANNUALLY">
    Annually
  </option>
</select>
    </div>
  );
}