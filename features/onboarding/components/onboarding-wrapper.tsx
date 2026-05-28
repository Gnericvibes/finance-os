import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function OnboardingWrapper({
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl border border-zinc-800 bg-zinc-950 rounded-3xl p-8 md:p-10 shadow-2xl">
        {children}
      </div>
    </main>
  );
}
