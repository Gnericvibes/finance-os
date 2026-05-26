"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F97316", // orange
  "#EC4899", // pink
  "#EAB308", // yellow
  "#22C55E", // green
  "#EF4444", // red
];

interface SpendingChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export function SpendingChart({
  data,
}: SpendingChartProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Spending Breakdown
        </h2>

        <p className="text-zinc-400 text-sm mt-1">
          Expense distribution by category
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center">
          <p className="text-zinc-500">
            No expense data yet.
          </p>
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={4}
              >
                {data.map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    "#18181b",
                  border:
                    "1px solid #27272a",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* LEGEND */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-3"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  COLORS[
                    index %
                      COLORS.length
                  ],
              }}
            />

            <div>
              <p className="text-sm text-white font-medium">
                {item.name}
              </p>

              <p className="text-xs text-zinc-400">
                ₦
                {item.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}