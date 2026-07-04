"use client";

import { useMemo, useState } from "react";

import { ExportButton } from "@/features/analytics/components/export-button";

interface Entry {
  id: string;
  type: string;
  title: string;
  description: string | null;
  amount: number;
  category: string;
  createdAt: string;
}

interface Props {
  entries: Entry[];
}

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Income", value: "INCOME" },
  { label: "Expenses", value: "EXPENSE" },
  { label: "Investment", value: "INVESTMENT" },
  { label: "Debt", value: "DEBT_PAYMENT" },
  { label: "Transfer", value: "TRANSFER" },
];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

const today = new Date();
const defaultThirtyDaysAgo = new Date();
defaultThirtyDaysAgo.setDate(today.getDate() - 30);

export function TransactionsClient({ entries }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState(formatDate(defaultThirtyDaysAgo));
  const [dateTo, setDateTo] = useState(formatDate(today));

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = entry.createdAt.split("T")[0];

      const matchesSearch =
        entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.category.toLowerCase().includes(search.toLowerCase());

      const matchesType = !typeFilter || entry.type === typeFilter;

      const matchesDate = entryDate >= dateFrom && entryDate <= dateTo;

      return matchesSearch && matchesType && matchesDate;
    });
  }, [entries, search, typeFilter, dateFrom, dateTo]);

  function applyPreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateFrom(formatDate(start));
    setDateTo(formatDate(end));
  }

  function applyMonth() {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    setDateFrom(formatDate(start));
    setDateTo(formatDate(end));
  }

  function applyYear() {
    const end = new Date();
    const start = new Date(end.getFullYear(), 0, 1);
    setDateFrom(formatDate(start));
    setDateTo(formatDate(end));
  }

  return (
    <div className="space-y-6">
      {/* SEARCH + EXPORT */}

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <input
          type="text"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-96 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-zinc-600 transition"
        />

        <ExportButton type="income" />
      </div>

      {/* TYPE FILTER BUTTONS */}

      <div className="flex flex-wrap gap-3">
        {TYPE_FILTERS.map((filter) => {
          const active = typeFilter === filter.value;

          return (
            <button
              key={filter.value}
              onClick={() => setTypeFilter(filter.value)}
              className={`px-4 py-2 rounded-xl border text-sm capitalize transition ${
                active
                  ? "bg-white text-black border-white"
                  : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* DATE FILTER */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => applyPreset(7)} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition text-sm">7D</button>
          <button onClick={() => applyPreset(30)} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition text-sm">30D</button>
          <button onClick={() => applyPreset(90)} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition text-sm">90D</button>
          <button onClick={applyMonth} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition text-sm">Month</button>
          <button onClick={applyYear} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition text-sm">Year</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-white transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-white transition"
            />
          </div>
        </div>
      </div>

      {/* TRANSACTIONS LIST */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            All Transactions
          </h2>

          <p className="text-sm text-zinc-400">
            {filteredEntries.length} Entries
          </p>
        </div>

        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <p className="text-zinc-500 py-8 text-center">No transactions found.</p>
          ) : (
            filteredEntries.map((entry) => {
              const entryDate = new Date(entry.createdAt).toLocaleDateString();

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between border border-zinc-800 rounded-2xl p-4 bg-black/40"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{entry.title}</p>
                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                      <span>{entry.category}</span>
                      <span className="text-zinc-600">•</span>
                      <span>{entryDate}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg text-white">
                      ₦{entry.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {entry.type.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
