"use client";

import { motion } from "framer-motion";

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

export function OnboardingProgress({
  currentStep,
}: Props) {
  const progress =
    (currentStep / steps.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`
              transition
              ${
                currentStep >= index + 1
                  ? "text-white"
                  : "text-zinc-600"
              }
            `}
          >
            {step}
          </div>
        ))}
      </div>

      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}