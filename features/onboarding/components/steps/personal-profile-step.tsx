"use client";

import { UseFormRegister, UseFormWatch } from "react-hook-form";

import { OnboardingFormValues } from "../../schemas/onboarding-schema";

interface Props {
  register: UseFormRegister<OnboardingFormValues>;
  watch: UseFormWatch<OnboardingFormValues>;
}

export function PersonalProfileStep({
  register,
  watch,
}: Props) {
  const hasDependents = watch("hasDependents");

  return (
    <div className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Full Name
        </label>

        <input
          {...register("fullName")}
          placeholder="Enter your full name"
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
        />
      </div>

      {/* Employment Status */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Employment Status
        </label>

        <select
          {...register("employmentType")}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
        >
          <option value="">
            Select employment status
          </option>

                    <option value="EMPLOYED">
            Salaried Employee
          </option>

          <option value="FREELANCER">
            Freelancer
          </option>

          <option value="BUSINESS_OWNER">
            Business Owner
          </option>

          <option value="SELF_EMPLOYED">
            Self Employed
          </option>

          <option value="STUDENT">
            Student
          </option>

          <option value="UNEMPLOYED">
            Unemployed
          </option>

          <option value="RETIRED">
            Retired
          </option>
        </select>
      </div>

      {/* Marital Status */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Marital Status
        </label>

        <select
          {...register("maritalStatus")}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
        >
          <option value="">
            Select marital status
          </option>

          <option value="SINGLE">
            Single
          </option>

          <option value="MARRIED">
            Married
          </option>

          <option value="DIVORCED">
            Divorced
          </option>

          <option value="WIDOWED">
            Widowed
          </option>
        </select>
      </div>

      {/* Dependents */}
      <div className="space-y-4">
        <label className="text-sm text-zinc-400">
          Do you have dependents?
        </label>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="radio"
              value="true"
              {...register("hasDependents")}
            />

            Yes
          </label>

          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="radio"
              value="false"
              {...register("hasDependents")}
            />

            No
          </label>
        </div>
      </div>

      {/* Number of Dependents */}
      {hasDependents === "true" && (
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            Number of Dependents
          </label>

          <input
            type="number"
            min={1}
            {...register("dependentsCount", {
              valueAsNumber: true,
            })}
            placeholder="Enter number of dependents"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none transition focus:border-zinc-600"
          />
        </div>
      )}
    </div>
  );
}