"use client";

import { useMemo, useState } from "react";

import { AnalyticsChart } from "@/features/analytics/components/analytics-chart";

import { AnalyticsFilters } from "@/features/analytics/components/analytics-filters";

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
}

const ITEMS_PER_PAGE = 10;

export function AnalyticsClient({
  entries,
  type,
}: AnalyticsClientProps) {
  /*
   -----------------------------------
   FILTER STATES
   -----------------------------------
  */

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
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

          const matchesCategory =
            !category ||
            entry.category ===
              category;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      entries,
      search,
      category,
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

  function handleCategory(
    value: string
  ) {
    setCategory(value);

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

      {/* FILTERS */}

      <AnalyticsFilters
        category={category}
        onCategoryChange={
          handleCategory
        }
      />

      {/* TOTAL */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
        <p className="text-sm text-zinc-400">
          Filtered Total
        </p>

        <h2 className="text-4xl font-bold mt-3">
          ₦
          {total.toLocaleString()}
        </h2>
      </div>

      {/* CHART */}

      <AnalyticsChart
        data={chartData}
        type={type}
      />

      {/* TABLE */}

      <div className="border border-zinc-800 bg-zinc-950 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-zinc-900">
              <tr>
                <th className="text-left p-4">
                  Title
                </th>

                <th className="text-left p-4">
                  Category
                </th>

                <th className="text-left p-4">
                  Amount
                </th>

                <th className="text-left p-4">
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
                    className="p-6 text-center text-zinc-500"
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
                      <td className="p-4">
                        {
                          entry.title
                        }
                      </td>

                      <td className="p-4 capitalize">
                        {
                          entry.category
                        }
                      </td>

                      <td className="p-4 font-semibold">
                        ₦
                        {entry.amount.toLocaleString()}
                      </td>

                      <td className="p-4 text-zinc-400">
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