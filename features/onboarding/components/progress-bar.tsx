"use client";

interface Props {
  step: number;
}

export function ProgressBar({
  step,
}: Props) {
  const progress =
    (step / 5) * 100;

  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-2 text-sm text-zinc-400">
        Step {step} of 5
      </div>
    </div>
  );
}