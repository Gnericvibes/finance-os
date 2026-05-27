"use client";

import { useMemo, useState } from "react";

interface Entry {
  id: string;

  title: string;

  category: string;

  amount: number;

  createdAt: Date;
}

export function useAnalyticsFilter(
  entries: Entry[]
) {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

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
            category === "all"
              ? true
              : entry.category ===
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

  return {
    search,

    setSearch,

    category,

    setCategory,

    filteredEntries,
  };
}