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

export function ExpenseStep({
  register,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">
          Expected Monthly Expenses
        </h2>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(
          [
            { name: "rentHousing", label: "Rent / Housing" },
            { name: "food", label: "Food" },
            { name: "transport", label: "Transport" },
            { name: "utilities", label: "Utilities" },
            { name: "schoolFees", label: "School Fees" },
            { name: "subscriptions", label: "Subscriptions" },
            { name: "healthCare", label: "Healthcare" },
            {
              name: "miscellaneousExpenses",
              label: "Other Expenses",
            },
          ] as const
        ).map(({ name, label }) => (
          <input
            key={name}
            type="number"
            placeholder={label}
            {...register(name, {
              valueAsNumber: true,
            })}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800"
          />
        ))}
      </div>

    </div>
  );
}