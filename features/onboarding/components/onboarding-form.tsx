"use client";

import { useForm } from "react-hook-form";

import {
  onboardingSchema,
  OnboardingFormValues,
} from "../schemas/onboarding-schema";

import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";

import { useOnboarding } from "../hooks/use-onboarding";

import { PersonalProfileStep } from "./steps/personal-profile-step";
import { IncomeStep } from "./steps/income-step";
import { ExpenseStep } from "./steps/expense-step";
import { DebtStep } from "./steps/debt-step";
import { GoalStep } from "./steps/goal-step";

import { OnboardingHeader } from "./onboarding-header";
import { OnboardingNavigation } from "./onboarding-navigation";
import { OnboardingComplete } from "./onboarding-complete";

export function OnboardingForm() {
  const router = useRouter();

  const {
    currentStep,
    nextStep,
    previousStep,
  } = useOnboarding();

  const form =
    useForm<OnboardingFormValues>({
      resolver:
        zodResolver(
          onboardingSchema
        ),

      defaultValues: {
        fullName: "",

        employmentType: "",

        maritalStatus: "",

        hasDependents: "false",

        dependentsCount:
          undefined,

        currency: "USD",

        mainMonthlyIncome:
          undefined,

        additionalIncome:
          undefined,

        incomeFrequency:
          "MONTHLY",

        rentHousing:
          undefined,

        food: undefined,

        transport:
          undefined,

        utilities:
          undefined,

        schoolFees:
          undefined,

        subscriptions:
          undefined,

        healthCare:
          undefined,

        miscellaneousExpenses:
          undefined,

        hasDebt: "false",

        totalDebt:
          undefined,

        debtDueDate: "",

        repaymentSchedule:
          "",

        repaymentAmount:
          undefined,

        financialGoal: "",

        emergencySavingsGoal:
          undefined,

        interestedInInvesting:
          false,
      },
    });

  const {
    register,
    watch,
    handleSubmit,
  } = form;

  async function onSubmit(
    values: OnboardingFormValues
  ) {
    try {
      localStorage.setItem(
        "pfos-onboarding",
        JSON.stringify(values)
      );

      router.push(
        "/allocations"
      );
    } catch (error) {
      console.error(error);
    }
  }

  function handleNext() {
    if (currentStep < 5) {
      nextStep();

      return;
    }

    handleSubmit(
      onSubmit
    )();
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <PersonalProfileStep
            register={register}
            watch={watch}
          />
        );

      case 2:
        return (
          <IncomeStep
            register={register}
          />
        );

      case 3:
        return (
          <ExpenseStep
            register={register}
          />
        );

      case 4:
        return (
          <DebtStep
            register={register}
            watch={watch}
          />
        );

      case 5:
        return (
          <GoalStep
            register={register}
          />
        );

      case 6:
        return (
          <OnboardingComplete
            title="PFOS Blueprint Ready"
            description="Your financial operating system has been generated successfully."
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* PAGE HEADER */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">
          Build Your Financial
          OS
        </h1>

        <p className="mt-3 text-zinc-400">
          Let’s understand
          your finances and
          generate your
          personalized PFOS
          blueprint.
        </p>
      </div>

      {/* CURRENT STEP HEADER */}

      <OnboardingHeader
        currentStep={
          currentStep
        }
      />

      {/* FORM CONTAINER */}

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl"
      >
        {renderStep()}
      </form>

      {/* NAVIGATION BUTTONS */}

      {currentStep < 6 && (
        <div className="mt-8">
          <OnboardingNavigation
            currentStep={
              currentStep
            }
            onNext={
              handleNext
            }
            onBack={
              previousStep
            }
          />
        </div>
      )}
    </div>
  );
}