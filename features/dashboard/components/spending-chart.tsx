"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SpendingChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function SpendingChart({
  data,
}: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
        <p className="text-zinc-500">
          No expense data available.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Spending Distribution
          </h2>

          <p className="text-zinc-400 text-sm mt-1">
            Expense category allocation
          </p>
        </div>
      </div>

      <div className="w-full h-[350px] min-h-[350px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart
            key={JSON.stringify(data)}
          >
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              innerRadius={55}
              paddingAngle={3}
            >
              {data.map(
                (_, index) => (
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
                color: "#ffffff",
              }}
              labelStyle={{
                color: "#ffffff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}