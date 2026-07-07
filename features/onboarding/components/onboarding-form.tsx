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

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full Name",
  employmentType: "Employment Type",
  maritalStatus: "Marital Status",
  hasDependents: "Do you have dependents?",
  dependentsCount: "Number of Dependents",
  currency: "Currency",
  mainMonthlyIncome: "Monthly Income",
  additionalIncome: "Additional Income",
  incomeFrequency: "Income Frequency",
  rentHousing: "Housing / Rent",
  food: "Food & Groceries",
  transport: "Transportation",
  utilities: "Utilities",
  schoolFees: "Education / School Fees",
  subscriptions: "Subscriptions / Lifestyle",
  healthCare: "Healthcare",
  miscellaneousExpenses: "Miscellaneous Expenses",
  hasDebt: "Do you have debt?",
  totalDebt: "Total Debt",
  debtDueDate: "Debt Due Date",
  repaymentAmount: "Monthly Repayment",
  financialGoal: "Financial Goal",
  emergencySavingsGoal: "Emergency Savings Goal",
  interestedInInvesting: "Interested in Investing",
};

export function OnboardingForm() {
  const router = useRouter();

  const { currentStep, nextStep, previousStep } = useOnboarding();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema) as unknown as Resolver<OnboardingFormValues>,
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {
      fullName: "",
      employmentType: "EMPLOYED",
      maritalStatus: "SINGLE",
      hasDependents: "false",
      dependentsCount: undefined,

      currency: "NGN",
      mainMonthlyIncome: undefined,
      additionalIncome: undefined,
      incomeFrequency: "MONTHLY",

      rentHousing: undefined,
      food: undefined,
      transport: undefined,
      utilities: undefined,
      schoolFees: undefined,
      subscriptions: undefined,
      healthCare: undefined,
      miscellaneousExpenses: undefined,

      hasDebt: "false",
      totalDebt: undefined,
      debtDueDate: "",
      repaymentAmount: undefined,

      financialGoal: "EMERGENCY_FUND",
      emergencySavingsGoal: undefined,
      interestedInInvesting: "true",
    },
  });

  const { register, watch, handleSubmit, formState: { errors, isSubmitted } } = form;

  async function onSubmit(values: OnboardingFormValues) {
    try {
      const result = await saveOnboarding(values);

      if (!result?.success) {
        alert("Unable to generate blueprint. Please try again.");
        return;
      }

      window.location.href = "/allocations";
    } catch (error) {
      console.error("Onboarding submit error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  function handleNext() {
    if (currentStep < 5) {
      nextStep();
      return;
    }

    handleSubmit(onSubmit)();
  }

  function renderStep() {
    switch (currentStep) {
      case 1: return <PersonalProfileStep register={register} watch={watch} />;
      case 2: return <IncomeStep register={register} />;
      case 3: return <ExpenseStep register={register} />;
      case 4: return <DebtStep register={register} watch={watch} />;
      case 5: return <GoalStep register={register} />;
      case 6: return <OnboardingComplete title="Blueprint Ready" description="Your personalized financial operating system has been created." />;
      default: return null;
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">Build Your Financial OS</h1>
        <p className="mt-3 text-zinc-400">
          Let&apos;s understand your finances and generate your personalized blueprint.
        </p>
      </div>

      <OnboardingHeader currentStep={currentStep} />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        {renderStep()}

        {/* Validation Errors — only show after trying to submit */}
        {isSubmitted && Object.keys(errors).length > 0 && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-medium text-red-400 mb-2">
              Please fix the following before continuing:
            </p>
            <ul className="space-y-1.5">
              {Object.entries(errors).map(([key, error]) => {
                const label = FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                const message = error?.message as string;
                return (
                  <li key={key} className="text-sm text-red-300">
                    <span className="font-medium text-red-200">{label}</span> — {message}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {currentStep < 6 && (
          <div className="mt-8">
            <OnboardingNavigation
              currentStep={currentStep}
              onNext={handleNext}
              onBack={previousStep}
            />
          </div>
        )}
      </form>
    </div>
  );
}
