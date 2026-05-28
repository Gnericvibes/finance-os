"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function OnboardingLayout({
  children,
}: Props) {
  return (
    <main
      className="
        min-h-screen
        bg-black
        text-white
        px-6
        py-10
      "
    >
      <div
        className="
          max-w-4xl
          mx-auto
        "
      >
        {children}
      </div>
    </main>
  );
}