"use client";

interface AnalyticsFiltersProps {
  category: string;

  onCategoryChange: (
    value: string
  ) => void;
}

const categories = [
  "all",
  "food",
  "transport",
  "shopping",
  "rent",
  "salary",
  "investment",
  "airtime",
  "health",
  "entertainment",
];

export function AnalyticsFilters({
  category,
  onCategoryChange,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((item) => {
        const active =
          category === item;

        return (
          <button
            key={item}
            onClick={() =>
              onCategoryChange(item)
            }
            className={`
              px-4
              py-2
              rounded-xl
              border
              text-sm
              capitalize
              transition
              ${
                active
                  ? "bg-white text-black border-white"
                  : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600"
              }
            `}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}