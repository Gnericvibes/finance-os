"use client";

import { create } from "zustand";

export interface OnboardingData {
  fullName: string;

  employmentType: string;

  monthlyIncome: number;

  additionalIncome?: number;

  incomeFrequency: string;

  rent: number;

  food: number;

  transport: number;

  utilities: number;

  schoolFees: number;

  familySupport: number;

  hasDebt: boolean;

  totalDebt?: number;

  monthlyDebtPayments?: number;

  debtInterestRate?: number;

  financialGoal: string;

  emergencySavingsGoal?: number;

  interestedInInvesting: boolean;
}

interface OnboardingState {
  /*
   -----------------------------------
   STEP
   -----------------------------------
  */

  currentStep: number;

  /*
   -----------------------------------
   DATA
   -----------------------------------
  */

  data: Partial<OnboardingData>;

  /*
   -----------------------------------
   NAVIGATION
   -----------------------------------
  */

  nextStep: () => void;

  previousStep: () => void;

  setStep: (
    step: number
  ) => void;

  /*
   -----------------------------------
   DATA UPDATE
   -----------------------------------
  */

  updateData: (
    values: Partial<OnboardingData>
  ) => void;

  /*
   -----------------------------------
   RESET
   -----------------------------------
  */

  reset: () => void;
}

export const useOnboardingStore =
  create<OnboardingState>(
    (set) => ({
      /*
       -----------------------------------
       INITIAL STATE
       -----------------------------------
      */

      currentStep: 1,

      data: {},

      /*
       -----------------------------------
       STEP CONTROLS
       -----------------------------------
      */

      nextStep: () =>
        set((state) => ({
          currentStep:
            state.currentStep + 1,
        })),

      previousStep: () =>
        set((state) => ({
          currentStep:
            state.currentStep - 1,
        })),

      setStep: (step) =>
        set({
          currentStep: step,
        }),

      /*
       -----------------------------------
       UPDATE DATA
       -----------------------------------
      */

      updateData: (
        values
      ) =>
        set((state) => ({
          data: {
            ...state.data,
            ...values,
          },
        })),

      /*
       -----------------------------------
       RESET
       -----------------------------------
      */

      reset: () =>
        set({
          currentStep: 1,

          data: {},
        }),
    })
  );