"use client";

interface AnalyticsSearchProps {
  value: string;

  onChange: (
    value: string
  ) => void;
}

export function AnalyticsSearch({
  value,
  onChange,
}: AnalyticsSearchProps) {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search transactions..."
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          w-full
          bg-zinc-950
          border
          border-zinc-800
          rounded-2xl
          px-4
          py-3
          text-white
          placeholder:text-zinc-500
          outline-none
          focus:border-zinc-600
          transition
        "
      />
    </div>
  );
}