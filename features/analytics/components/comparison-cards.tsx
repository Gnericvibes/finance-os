import { TrendBadge } from "./trend-badge";

interface ComparisonCardsProps {
  current: number;

  previous: number;

  percentage: number;

  trend:
    | "up"
    | "down"
    | "neutral";
}

export function ComparisonCards({
  current,
  previous,
  percentage,
  trend,
}: ComparisonCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* CURRENT */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
        <p className="text-zinc-400 text-sm">
          Current Period
        </p>

        <h2 className="text-4xl font-bold mt-3">
          ₦
          {current.toLocaleString()}
        </h2>
      </div>

      {/* PREVIOUS */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
        <p className="text-zinc-400 text-sm">
          Previous Period
        </p>

        <h2 className="text-4xl font-bold mt-3">
          ₦
          {previous.toLocaleString()}
        </h2>
      </div>

      {/* CHANGE */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 flex flex-col justify-between">
        <p className="text-zinc-400 text-sm">
          Period Change
        </p>

        <div className="mt-3">
          <TrendBadge
            value={percentage}
            trend={trend}
          />
        </div>
      </div>
    </div>
  );
}