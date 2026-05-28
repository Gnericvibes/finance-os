"use client";

import { create } from "zustand";

interface OnboardingState {
  currentStep: number;

  nextStep: () => void;

  previousStep: () => void;

  goToStep: (
    step: number
  ) => void;
}

export const useOnboarding =
  create<OnboardingState>(
    (set) => ({
      currentStep: 1,

      nextStep: () =>
        set((state) => ({
          currentStep:
            state.currentStep < 6
              ? state.currentStep + 1
              : 6,
        })),

      previousStep: () =>
        set((state) => ({
          currentStep:
            state.currentStep > 1
              ? state.currentStep - 1
              : 1,
        })),

      goToStep: (
        step
      ) =>
        set({
          currentStep: step,
        }),
    })
  );