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
      {/* Currency */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Currency
        </label>

        <select
          {...register("currency")}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
        >
          <option value="NGN">₦ NGN — Nigerian Naira</option>
          <option value="USD">$ USD — US Dollar</option>
          <option value="GBP">£ GBP — British Pound</option>
          <option value="EUR">€ EUR — Euro</option>
          <option value="CAD">$ CAD — Canadian Dollar</option>
          <option value="AUD">$ AUD — Australian Dollar</option>
          <option value="AED">د.إ AED — UAE Dirham</option>
          <option value="ZAR">R ZAR — South African Rand</option>
          <option value="KES">KSh KES — Kenyan Shilling</option>
          <option value="GHS">₵ GHS — Ghanaian Cedi</option>
        </select>
      </div>

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