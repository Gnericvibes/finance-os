"use client";

import { ReactNode } from "react";

interface Props {
  title: string;

  description: string;

  children: ReactNode;
}

export function OnboardingShell({
  title,
  description,
  children,
}: Props) {
  return (
    <div
      className="
        max-w-3xl
        mx-auto
        min-h-screen
        flex
        flex-col
        justify-center
        p-8
      "
    >
      <div className="space-y-3 mb-10">
        <h1 className="text-5xl font-bold">
          {title}
        </h1>

        <p className="text-zinc-400">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}