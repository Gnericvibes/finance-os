"use client";

import { create } from "zustand";

import { OnboardingFormValues } from "@/features/onboarding/schemas/onboarding-schema";

interface OnboardingStore {
  data: OnboardingFormValues | null;

  setData: (
    data: OnboardingFormValues
  ) => void;
}

export const useOnboardingStore =
  create<OnboardingStore>((set) => ({
    data: null,

    setData: (data) =>
      set({
        data,
      }),
  }));