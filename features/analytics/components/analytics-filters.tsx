"use client";

interface AnalyticsFiltersProps {
  currentFilter: string;
}

const filters = [
  "7D",
  "30D",
  "90D",
  "1Y",
  "ALL",
];

export function AnalyticsFilters({
  currentFilter,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter}
          className={`px-4 py-2 rounded-xl border transition-all ${
            currentFilter === filter
              ? "bg-white text-black border-white"
              : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}