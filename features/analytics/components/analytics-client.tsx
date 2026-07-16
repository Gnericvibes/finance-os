"use client";

import { useMemo, useState } from "react";

import { AnalyticsChart } from "@/features/analytics/components/analytics-chart";

import { AnalyticsSearch } from "@/features/analytics/components/analytics-search";

import { Pagination } from "./pagination";

interface Entry {
  id: string;

  title: string;

  category: string;

  amount: number;

  createdAt: Date;
}

interface AnalyticsClientProps {
  entries: Entry[];

  type: string;

  currencySymbol?: string;
}

const ITEMS_PER_PAGE = 10;

export function AnalyticsClient({
  entries,
  type,
  currencySymbol = "₦",
}: AnalyticsClientProps) {
  /*
   -----------------------------------
   FILTER STATES
   -----------------------------------
  */

        const [search, setSearch] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  /*
   -----------------------------------
   FILTERED ENTRIES
   -----------------------------------
  */

  const filteredEntries =
    useMemo(() => {
      return entries.filter(
        (entry) => {
                    const matchesSearch =
            entry.title
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            entry.category
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          return matchesSearch;
        }
      );
    }, [
      entries,
      search,
    ]);

  /*
   -----------------------------------
   PAGINATION
   -----------------------------------
  */

  const totalPages = Math.ceil(
    filteredEntries.length /
      ITEMS_PER_PAGE
  );

  const paginatedEntries =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      const end =
        start + ITEMS_PER_PAGE;

      return filteredEntries.slice(
        start,
        end
      );
    }, [
      filteredEntries,
      currentPage,
    ]);

  /*
   -----------------------------------
   TOTAL
   -----------------------------------
  */

  const total =
    filteredEntries.reduce(
      (acc, entry) =>
        acc + entry.amount,
      0
    );

  /*
   -----------------------------------
   CHART DATA
   -----------------------------------
  */

  const chartData =
    useMemo(() => {
      /*
       EXPENSES → CATEGORY PIE
      */

      if (type === "expenses") {
        const categoryMap =
          new Map<
            string,
            number
          >();

        filteredEntries.forEach(
          (entry) => {
            const current =
              categoryMap.get(
                entry.category
              ) || 0;

            categoryMap.set(
              entry.category,
              current +
                entry.amount
            );
          }
        );

        return Array.from(
          categoryMap.entries()
        ).map(
          ([name, value]) => ({
            name,
            value,
          })
        );
      }

      /*
       INCOME / INVESTMENTS
      */

      const groupedMap =
        new Map<
          string,
          number
        >();

      filteredEntries.forEach(
        (entry) => {
          const date =
            new Date(
              entry.createdAt
            ).toLocaleDateString();

          const current =
            groupedMap.get(
              date
            ) || 0;

          groupedMap.set(
            date,
            current +
              entry.amount
          );
        }
      );

      return Array.from(
        groupedMap.entries()
      ).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
    }, [
      filteredEntries,
      type,
    ]);

  /*
   -----------------------------------
   RESET PAGE ON FILTER
   -----------------------------------
  */

        function handleSearch(
    value: string
  ) {
    setSearch(value);

    setCurrentPage(1);
  }

  /*
   -----------------------------------
   UI
   -----------------------------------
  */

  return (
    <div className="space-y-8">
      {/* SEARCH */}

            <AnalyticsSearch
              value={search}
              onChange={
                handleSearch
              }
            />

            {/* TOTAL */}

            <div className="border border-zinc-800 bg-zinc-950 rounded-2xl lg:rounded-3xl p-5 lg:p-6">
        <p className="text-xs lg:text-sm text-zinc-400">
          Filtered Total
        </p>

        <h2 className="text-2xl lg:text-4xl font-bold mt-2 lg:mt-3">
          {currencySymbol}
          {total.toLocaleString()}
        </h2>
      </div>

      {/* CHART */}

      <AnalyticsChart
        data={chartData}
        type={type}
        currencySymbol={currencySymbol}
      />

      {/* TABLE */}

            <div className="border border-zinc-800 bg-zinc-950 rounded-2xl lg:rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] lg:min-w-0">
            <thead className="bg-zinc-900">
              <tr>
                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm">
                  Title
                </th>

                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm">
                  Category
                </th>

                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm">
                  Amount
                </th>

                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedEntries.length ===
              0 ? (
                                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-zinc-500 text-sm"
                  >
                    No entries found.
                  </td>
                </tr>
              ) : (
                                paginatedEntries.map(
                  (entry) => (
                    <tr
                      key={
                        entry.id
                      }
                      className="border-t border-zinc-800"
                    >
                      <td className="p-3 lg:p-4 text-sm lg:text-base">
                        {
                          entry.title
                        }
                      </td>

                      <td className="p-3 lg:p-4 text-sm lg:text-base capitalize">
                        {
                          entry.category
                        }
                      </td>

                      <td className="p-3 lg:p-4 text-sm lg:text-base font-semibold">
                        {currencySymbol}
                        {entry.amount.toLocaleString()}
                      </td>

                      <td className="p-3 lg:p-4 text-sm lg:text-base text-zinc-400">
                        {new Date(
                          entry.createdAt
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}

      <Pagination
        currentPage={
          currentPage
        }
        totalPages={
          totalPages
        }
        onPageChange={
          setCurrentPage
        }
      />
    </div>
  );
}