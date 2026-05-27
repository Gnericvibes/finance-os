"use client";

import Link from "next/link";

interface PaginationControlsProps {
  currentPage: number;

  totalPages: number;

  type: string;

  from?: string;

  to?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  type,
  from,
  to,
}: PaginationControlsProps) {
  /*
   -----------------------------------
   BUILD URL
   -----------------------------------
  */

  function buildUrl(page: number) {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      page.toString()
    );

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    return `/analytics/${type}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950 rounded-2xl p-4">
      {/* PREVIOUS */}

      <div>
        {currentPage > 1 ? (
          <Link
            href={buildUrl(
              currentPage - 1
            )}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition"
          >
            ← Previous
          </Link>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-zinc-900/40 text-zinc-600 cursor-not-allowed">
            ← Previous
          </div>
        )}
      </div>

      {/* INFO */}

      <div className="text-sm text-zinc-400">
        Page {currentPage} of{" "}
        {totalPages}
      </div>

      {/* NEXT */}

      <div>
        {currentPage <
        totalPages ? (
          <Link
            href={buildUrl(
              currentPage + 1
            )}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition"
          >
            Next →
          </Link>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-zinc-900/40 text-zinc-600 cursor-not-allowed">
            Next →
          </div>
        )}
      </div>
    </div>
  );
}