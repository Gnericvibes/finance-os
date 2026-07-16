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

  currencySymbol?: string;
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
  currencySymbol = "₦",
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

    "debt-payment":
      "Debt Repayment Progress",

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

    "debt-payment":
      "Debt reduction and repayment tracking",

    budgets:
      "Planned vs actual budget comparison",
  };

  /*
   -----------------------------------
   CUSTOM TOOLTIP
   -----------------------------------
  */

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 shadow-2xl">
          <p className="text-sm text-zinc-400 mb-1">{label || payload[0].name}</p>
          <p className="text-lg font-bold text-white">
            {currencySymbol}
            {Number(payload[0].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
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

      <div className="w-full h-[300px] lg:h-[420px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          {/* EXPENSES - DONUT CHART */}

          {type ===
          "expenses" ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={4}
                cornerRadius={6}
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
                      stroke="transparent"
                    />
                  )
                )}
              </Pie>

              <Tooltip
                content={<CustomTooltip />}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "13px",
                  color: "#a1a1aa",
                }}
                iconType="circle"
                iconSize={10}
              />
            </PieChart>
          ) : type ===
            "income" ? (
            /* INCOME - GRADIENT AREA */

            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
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
                      0.5
                    }
                  />

                  <stop
                    offset="100%"
                    stopColor="#22c55e"
                    stopOpacity={
                      0.05
                    }
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#27272a"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#52525b"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#52525b"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
              />

              <Tooltip
                content={<CustomTooltip />}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                fill="url(#incomeGradient)"
                strokeWidth={3}
                dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                activeDot={{ fill: "#22c55e", stroke: "#09090b", strokeWidth: 3, r: 6 }}
              />
            </AreaChart>
          ) : type ===
            "debt-payment" ? (
            /* DEBT - BAR CHART WITH GREEN GRADIENT */

            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
              barCategoryGap="30%"
            >
              <defs>
                <linearGradient
                  id="debtGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.5} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#27272a"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#52525b"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#52525b"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
              />

              <Tooltip
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                fill="url(#debtGradient)"
                maxBarSize={60}
              />
            </BarChart>
          ) : (
            /* INVESTMENTS + OTHER - GRADIENT BAR CHART */

            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
              barCategoryGap="30%"
            >
              <defs>
                <linearGradient id="investGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.5} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#27272a"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#52525b"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#52525b"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
              />

              <Tooltip
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                fill="url(#investGradient)"
                maxBarSize={60}
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