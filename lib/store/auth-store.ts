"use client";

import { create } from "zustand";

interface User {
  id: string;
  email: string;
  onboardingCompleted: boolean;
}

interface AuthStore {
  user: User | null;

  signIn: (user: User) => void;

  signOut: () => void;

  completeOnboarding: () => void;
}

export const useAuthStore =
  create<AuthStore>((set) => ({
    user: null,

    signIn: (user) =>
      set({
        user,
      }),

    signOut: () =>
      set({
        user: null,
      }),

    completeOnboarding: () =>
      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              onboardingCompleted: true,
            }
          : null,
      })),
  }));