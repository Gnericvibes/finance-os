interface AIInsightsProps {
  insights: string[];
}

export function AIInsights({
  insights,
}: AIInsightsProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          AI Financial Insights
        </h2>

        <p className="text-zinc-400 mt-2">
          Behavioral analysis and
          financial intelligence
        </p>
      </div>

      <div className="space-y-4">
        {insights.length ===
        0 ? (
          <p className="text-zinc-500">
            No insights available.
          </p>
        ) : (
          insights.map(
            (
              insight,
              index
            ) => (
              <div
                key={index}
                className="
                  border
                  border-zinc-800
                  bg-black/40
                  rounded-2xl
                  p-4
                  text-sm
                  text-zinc-300
                "
              >
                {insight}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
