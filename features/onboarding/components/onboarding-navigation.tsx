"use client";

interface Props {
  currentStep: number;

  onNext: () => void;

  onBack: () => void;
}

export function OnboardingNavigation({
  currentStep,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 1}
        className="rounded-2xl border border-zinc-700 px-6 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-40"
      >
        Back
      </button>

            <button
        type={currentStep === 5 ? "submit" : "button"}
        onClick={currentStep === 5 ? undefined : onNext}
        className="rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90"
      >
        {currentStep === 5
          ? "Finish"
          : "Next"}
      </button>
    </div>
  );
}