"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

interface Props {
  currentType: string;
}

export function DateRangeFilter({
  currentType,
}: Props) {
  /*
   -----------------------------------
   ROUTER
   -----------------------------------
  */

  const router = useRouter();

  /*
   -----------------------------------
   TODAY
   -----------------------------------
  */

  const today =
    new Date();

  /*
   -----------------------------------
   FORMAT DATE
   -----------------------------------
  */

  function formatDate(
    date: Date
  ) {
    return date
      .toISOString()
      .split("T")[0];
  }

  /*
   -----------------------------------
   DEFAULT DATES
   -----------------------------------
  */

  const defaultTo =
    formatDate(today);

  const defaultFromDate =
    new Date();

  defaultFromDate.setDate(
    today.getDate() - 30
  );

  const defaultFrom =
    formatDate(
      defaultFromDate
    );

  /*
   -----------------------------------
   STATE
   -----------------------------------
  */

  const [from, setFrom] =
    useState(defaultFrom);

  const [to, setTo] =
    useState(defaultTo);

  /*
   -----------------------------------
   PRESET HANDLER
   -----------------------------------
  */

  function applyPreset(
    days: number
  ) {
    const end =
      new Date();

    const start =
      new Date();

    start.setDate(
      end.getDate() - days
    );

    const fromDate =
      formatDate(start);

    const toDate =
      formatDate(end);

    setFrom(fromDate);

    setTo(toDate);

    router.push(
      `/analytics/${currentType}?from=${fromDate}&to=${toDate}`
    );
  }

  /*
   -----------------------------------
   MONTH PRESET
   -----------------------------------
  */

  function applyMonth() {
    const end =
      new Date();

    const start =
      new Date(
        end.getFullYear(),
        end.getMonth(),
        1
      );

    const fromDate =
      formatDate(start);

    const toDate =
      formatDate(end);

    setFrom(fromDate);

    setTo(toDate);

    router.push(
      `/analytics/${currentType}?from=${fromDate}&to=${toDate}`
    );
  }

  /*
   -----------------------------------
   YEAR PRESET
   -----------------------------------
  */

  function applyYear() {
    const end =
      new Date();

    const start =
      new Date(
        end.getFullYear(),
        0,
        1
      );

    const fromDate =
      formatDate(start);

    const toDate =
      formatDate(end);

    setFrom(fromDate);

    setTo(toDate);

    router.push(
      `/analytics/${currentType}?from=${fromDate}&to=${toDate}`
    );
  }

  /*
   -----------------------------------
   APPLY FILTER
   -----------------------------------
  */

  function applyFilter() {
    router.push(
      `/analytics/${currentType}?from=${from}&to=${to}`
    );
  }

  /*
   -----------------------------------
   UI
   -----------------------------------
  */

  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-6">
      {/* PRESETS */}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() =>
            applyPreset(7)
          }
          className="
            px-4
            py-2
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            hover:border-zinc-600
            transition
          "
        >
          7D
        </button>

        <button
          onClick={() =>
            applyPreset(30)
          }
          className="
            px-4
            py-2
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            hover:border-zinc-600
            transition
          "
        >
          30D
        </button>

        <button
          onClick={() =>
            applyPreset(90)
          }
          className="
            px-4
            py-2
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            hover:border-zinc-600
            transition
          "
        >
          90D
        </button>

        <button
          onClick={applyMonth}
          className="
            px-4
            py-2
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            hover:border-zinc-600
            transition
          "
        >
          Month
        </button>

        <button
          onClick={applyYear}
          className="
            px-4
            py-2
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            hover:border-zinc-600
            transition
          "
        >
          Year
        </button>
      </div>

      {/* CALENDAR FILTERS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* FROM */}

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            From
          </label>

          <input
            type="date"
            value={from}
            onChange={(e) =>
              setFrom(
                e.target.value
              )
            }
            className="
              w-full
              bg-black
              border
              border-zinc-800
              rounded-2xl
              px-4
              py-3
              outline-none
              focus:border-white
              transition
            "
          />
        </div>

        {/* TO */}

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            To
          </label>

          <input
            type="date"
            value={to}
            onChange={(e) =>
              setTo(
                e.target.value
              )
            }
            className="
              w-full
              bg-black
              border
              border-zinc-800
              rounded-2xl
              px-4
              py-3
              outline-none
              focus:border-white
              transition
            "
          />
        </div>

        {/* APPLY */}

        <div className="flex items-end">
          <button
            onClick={
              applyFilter
            }
            className="
              w-full
              bg-white
              text-black
              font-semibold
              rounded-2xl
              py-3
              hover:opacity-90
              transition
            "
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}