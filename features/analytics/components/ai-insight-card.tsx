interface AIInsightCardProps {
  insight: string;
}

export function AIInsightCard({
  insight,
}: AIInsightCardProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-green-400" />

        <h2 className="text-2xl font-bold text-white">
          AI Insight
        </h2>
      </div>

      <p className="text-zinc-300 leading-relaxed">
        {insight}
      </p>
    </div>
  );
}