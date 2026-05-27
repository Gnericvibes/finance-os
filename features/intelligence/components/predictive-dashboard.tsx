interface PredictiveDashboardProps {
  projectedSpending: number;

  forecastSavings: number;

  burnRate: number;

  runway: number | string;

  healthScore: number;

  healthLabel: string;

  investmentProjection: number;
}

export function PredictiveDashboard({
  projectedSpending,
  forecastSavings,
  burnRate,
  runway,
  healthScore,
  healthLabel,
  investmentProjection,
}: PredictiveDashboardProps) {
  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div>
        <h2 className="text-2xl font-bold">
          Predictive Intelligence
        </h2>

        <p className="text-zinc-400 mt-2">
          Forecasting, projections,
          and financial health
        </p>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card
          title="Projected Monthly Spending"
          value={`₦${projectedSpending.toLocaleString()}`}
        />

        <Card
          title="Forecast Savings"
          value={`₦${forecastSavings.toLocaleString()}`}
        />

        <Card
          title="Daily Burn Rate"
          value={`₦${Math.round(
            burnRate
          ).toLocaleString()}`}
        />

        <Card
          title="Financial Runway"
          value={`${runway} days`}
        />

        <Card
          title="Health Score"
          value={`${healthScore}/100`}
        />

        <Card
          title="Health Status"
          value={healthLabel}
        />

        <Card
          title="5-Year Investment Projection"
          value={`₦${investmentProjection.toLocaleString()}`}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;

  value: string;
}) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-3">
        {value}
      </h3>
    </div>
  );
}