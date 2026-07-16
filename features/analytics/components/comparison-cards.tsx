import { TrendBadge } from "./trend-badge";

interface ComparisonCardsProps {
  current: number;

  previous: number;

  percentage: number;

  trend:
    | "up"
    | "down"
    | "neutral";

  currencySymbol?: string;
}

export function ComparisonCards({
  current,
  previous,
  percentage,
  trend,
  currencySymbol = "₦",
}: ComparisonCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6">
      {/* CURRENT */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-2xl lg:rounded-3xl p-5 lg:p-6">
        <p className="text-zinc-400 text-xs lg:text-sm">
          Current Period
        </p>

        <h2 className="text-2xl lg:text-4xl font-bold mt-2 lg:mt-3 truncate">
          {currencySymbol}
          {current.toLocaleString()}
        </h2>
      </div>

      {/* PREVIOUS */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-2xl lg:rounded-3xl p-5 lg:p-6">
        <p className="text-zinc-400 text-xs lg:text-sm">
          Previous Period
        </p>

        <h2 className="text-2xl lg:text-4xl font-bold mt-2 lg:mt-3 truncate">
          {currencySymbol}
          {previous.toLocaleString()}
        </h2>
      </div>

      {/* CHANGE */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-2xl lg:rounded-3xl p-5 lg:p-6 flex flex-col justify-between">
        <p className="text-zinc-400 text-xs lg:text-sm">
          Period Change
        </p>

        <div className="mt-2 lg:mt-3">
          <TrendBadge
            value={percentage}
            trend={trend}
          />
        </div>
      </div>
    </div>
  );
}