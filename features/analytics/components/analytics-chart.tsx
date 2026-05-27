"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsChartProps {
  type: string;

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

/*
 -----------------------------------
 COMPONENT
 -----------------------------------
*/

export function AnalyticsChart({
  type,
  data,
}: AnalyticsChartProps) {
  /*
   -----------------------------------
   EMPTY STATE
   -----------------------------------
  */

  if (data.length === 0) {
    return (
      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-10 text-center">
        <p className="text-zinc-500">
          No analytics data available.
        </p>
      </div>
    );
  }

  /*
   -----------------------------------
   TITLE MAP
   -----------------------------------
  */

  const titleMap: Record<
    string,
    string
  > = {
    income:
      "Income Performance",

    expenses:
      "Expense Distribution",

    investments:
      "Investment Growth",

    budgets:
      "Budget Allocation",
  };

  /*
   -----------------------------------
   DESCRIPTION MAP
   -----------------------------------
  */

  const descriptionMap: Record<
    string,
    string
  > = {
    income:
      "Revenue trend analytics over time",

    expenses:
      "Category-based spending intelligence",

    investments:
      "Capital allocation and growth tracking",

    budgets:
      "Planned vs actual budget comparison",
  };

  /*
   -----------------------------------
   UI
   -----------------------------------
  */

  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-8">
      {/* HEADER */}

      <div>
        <h2 className="text-2xl font-bold text-white">
          {titleMap[type] ||
            "Analytics"}
        </h2>

        <p className="text-sm text-zinc-400 mt-1">
          {descriptionMap[
            type
          ] ||
            "Financial visualization"}
        </p>
      </div>

      {/* CHART */}

      <div className="w-full h-[420px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          {/* EXPENSES */}

          {type ===
          "expenses" ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={140}
                paddingAngle={3}
              >
                {data.map(
                  (
                    _,
                    index
                  ) => (
                    <Cell
                      key={
                        index
                      }
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
                    "#09090b",
                  border:
                    "1px solid #27272a",
                  borderRadius:
                    "16px",
                  color:
                    "#ffffff",
                }}
                labelStyle={{
                  color:
                    "#ffffff",
                }}
              />

              <Legend />
            </PieChart>
          ) : type ===
            "income" ? (
            /* INCOME */

            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient
                  id="incomeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#22c55e"
                    stopOpacity={
                      0.7
                    }
                  />

                  <stop
                    offset="100%"
                    stopColor="#22c55e"
                    stopOpacity={
                      0
                    }
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
              />

              <XAxis
                dataKey="name"
                stroke="#a1a1aa"
              />

              <YAxis
                stroke="#a1a1aa"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    "#09090b",
                  border:
                    "1px solid #27272a",
                  borderRadius:
                    "16px",
                  color:
                    "#ffffff",
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                fill="url(#incomeGradient)"
                strokeWidth={
                  3
                }
              />
            </AreaChart>
          ) : (
            /* INVESTMENTS + OTHER */

            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
              />

              <XAxis
                dataKey="name"
                stroke="#a1a1aa"
              />

              <YAxis
                stroke="#a1a1aa"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    "#09090b",
                  border:
                    "1px solid #27272a",
                  borderRadius:
                    "16px",
                  color:
                    "#ffffff",
                }}
              />

              <Bar
                dataKey="value"
                radius={[
                  10,
                  10,
                  0,
                  0,
                ]}
              >
                {data.map(
                  (
                    _,
                    index
                  ) => (
                    <Cell
                      key={
                        index
                      }
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}