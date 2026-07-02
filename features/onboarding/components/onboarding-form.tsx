"use client";

import { useForm, type Resolver } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  onboardingSchema,
  OnboardingFormValues,
} from "../schemas/onboarding-schema";

import { useOnboarding } from "../hooks/use-onboarding";

import { PersonalProfileStep } from "./steps/personal-profile-step";
import { IncomeStep } from "./steps/income-step";
import { ExpenseStep } from "./steps/expense-step";
import { DebtStep } from "./steps/debt-step";
import { GoalStep } from "./steps/goal-step";

import { OnboardingHeader } from "./onboarding-header";
import { OnboardingNavigation } from "./onboarding-navigation";
import { OnboardingComplete } from "./onboarding-complete";

import { saveOnboarding } from "@/features/onboarding/actions/save-onboarding";


export function OnboardingForm() {
  const router = useRouter();

  const {
    currentStep,
    nextStep,
    previousStep,
  } = useOnboarding();

    const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema) as unknown as Resolver<OnboardingFormValues>,


      defaultValues: {
        /*
         -----------------------------------
         PERSONAL PROFILE
         -----------------------------------
        */

        fullName: "",

        employmentType:
          "EMPLOYED",

        maritalStatus:
          "SINGLE",

        hasDependents:
          "false",

        dependentsCount:
          undefined,

        /*
         -----------------------------------
         INCOME
         -----------------------------------
        */

        currency: "NGN",

        mainMonthlyIncome:
          undefined,

        additionalIncome:
          undefined,

        incomeFrequency:
          "MONTHLY",

        /*
         -----------------------------------
         EXPENSES
         -----------------------------------
        */

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

        /*
         -----------------------------------
         DEBT
         -----------------------------------
        */

        hasDebt: "false",

        totalDebt:
          undefined,

        debtDueDate: "",

        repaymentSchedule:
          "",

        repaymentAmount:
          undefined,

        /*
         -----------------------------------
         GOALS
         -----------------------------------
        */

        financialGoal:
          "EMERGENCY_FUND",

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
      const result =
        await saveOnboarding(
          values
        );

      if (
        !result?.success
      ) {
        alert(
          "Unable to generate blueprint."
        );
        return;
      }

      router.push(
        "/allocations"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong."
      );
    }
  }

  function handleNext() {
    if (
      currentStep < 5
    ) {
      nextStep();
      return;
    }

    handleSubmit(
      onSubmit
    )();
  }

  function renderStep() {
    switch (
      currentStep
    ) {
      case 1:
        return (
          <PersonalProfileStep
            register={
              register
            }
            watch={watch}
          />
        );

      case 2:
        return (
          <IncomeStep
            register={
              register
            }
          />
        );

      case 3:
        return (
          <ExpenseStep
            register={
              register
            }
          />
        );

      case 4:
        return (
          <DebtStep
            register={
              register
            }
            watch={watch}
          />
        );

      case 5:
        return (
          <GoalStep
            register={
              register
            }
          />
        );

      case 6:
        return (
          <OnboardingComplete
            title="Blueprint Ready"
            description="Your personalized financial operating system has been created."
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">
          Build Your Financial OS
        </h1>

        <p className="mt-3 text-zinc-400">
                    Let&apos;s understand your finances and

          generate your personalized blueprint.
        </p>
      </div>

      <OnboardingHeader
        currentStep={
          currentStep
        }
      />

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl"
      >
        {renderStep()}
      </form>

      {currentStep <
        6 && (
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