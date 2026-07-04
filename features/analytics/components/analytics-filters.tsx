"use client";

interface AnalyticsFiltersProps {
  category: string;
  onCategoryChange: (value: string) => void;
  type?: string;
}

const FILTERS_BY_TYPE: Record<string, string[]> = {
  income: ["all", "Salary", "Freelance", "Business", "Investment Returns", "Bonus", "Commission", "Dividends"],
  expenses: ["all", "Rent / Housing", "Food & Groceries", "Transport", "Utilities", "School Fees", "Subscriptions", "Healthcare", "Miscellaneous"],
  investments: ["all", "Stocks", "Treasury Bills", "Mutual Funds", "Real Estate", "Crypto", "Bonds", "ETFs"],
  "debt-payment": ["all", "Loan Repayment", "Credit Card", "Mortgage", "Student Loan", "Personal Loan"],
  transfer: ["all", "Wallet Transfer", "Bank Transfer", "Savings Transfer", "Auto-Save"],
};

export function AnalyticsFilters({
  category,
  onCategoryChange,
  type,
}: AnalyticsFiltersProps) {
  const filters = type ? FILTERS_BY_TYPE[type] ?? ["all"] : ["all"];

  return (
    <div className="flex flex-wrap gap-3">
            {filters.map((item) => {
        const active = item === "all" ? !category : category === item;

        return (
                    <button
            key={item}
            onClick={() => onCategoryChange(item === "all" ? "" : item)}
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