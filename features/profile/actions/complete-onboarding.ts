"use server";

/*
  Deprecated onboarding flow.

  The active onboarding flow for Finance OS lives in:
  - app/onboarding/page.tsx
  - features/onboarding/**

  This action is kept only to avoid import breakages.
*/

export async function completeOnboarding(data: unknown) {
  void data;

  return {

    success: false,
    error: "Deprecated. Please use /onboarding.",
    profile: null,
    blueprint: null,
  };
}