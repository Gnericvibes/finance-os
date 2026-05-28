"use client";

interface Props {
  currentStep: number;
}

const steps = [
  "Profile",
  "Income",
  "Expenses",
  "Debt",
  "Goals",
];

export function OnboardingHeader({
  currentStep,
}: Props) {
  return (
    <div className="mb-6">
      <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3">
        <h2 className="text-sm font-semibold tracking-wide text-white">
          {steps[currentStep - 1]}
        </h2>
      </div>
    </div>
  );
}