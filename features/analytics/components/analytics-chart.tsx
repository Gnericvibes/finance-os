"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface AnalyticsChartProps {
  data: {
    month: string;
    total: number;
  }[];
}

export function AnalyticsChart({
  data,
}: AnalyticsChartProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 h-[400px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Monthly Trend
        </h2>

        <p className="text-zinc-400 text-sm mt-1">
          Financial movement over
          time
        </p>
      </div>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
          />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="total"
            stroke="#ffffff"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}