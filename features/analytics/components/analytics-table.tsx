"use client";

interface AnalyticsTableProps {
  entries: {
    id: string;

    title: string;

    category: string;

    amount: number;

    type: string;

    createdAt: Date;
  }[];
}

export function AnalyticsTable({
  entries,
}: AnalyticsTableProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden">
      {/* HEADER */}

      <div className="grid grid-cols-5 gap-4 border-b border-zinc-800 px-6 py-4 bg-zinc-900 text-sm text-zinc-400 font-medium">
        <p>Title</p>

        <p>Category</p>

        <p>Type</p>

        <p>Amount</p>

        <p>Date</p>
      </div>

      {/* ROWS */}

      <div>
        {entries.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No entries found.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-5 gap-4 px-6 py-5 border-b border-zinc-900 hover:bg-zinc-900/40 transition"
            >
              <div>
                <p className="font-medium text-white">
                  {entry.title}
                </p>
              </div>

              <div>
                <p className="text-zinc-300 capitalize">
                  {entry.category}
                </p>
              </div>

              <div>
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${
                    entry.type ===
                    "INCOME"
                      ? "border-green-500 text-green-400"
                      : entry.type ===
                        "INVESTMENT"
                      ? "border-blue-500 text-blue-400"
                      : "border-red-500 text-red-400"
                  }`}
                >
                  {entry.type.replaceAll(
                    "_",
                    " "
                  )}
                </span>
              </div>

              <div>
                <p className="font-bold text-white">
                  ₦
                  {entry.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-zinc-400 text-sm">
                  {new Date(
                    entry.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}