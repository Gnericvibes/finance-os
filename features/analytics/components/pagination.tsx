"use client";

interface PaginationProps {
  currentPage: number;

  totalPages: number;

  onPageChange: (
    page: number
  ) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  /*
   -----------------------------------
   PREVENT INVALID
   -----------------------------------
  */

  if (totalPages <= 1) {
    return null;
  }

  /*
   -----------------------------------
   GENERATE PAGES
   -----------------------------------
  */

  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {/* PREVIOUS */}

      <button
        onClick={() =>
          onPageChange(
            currentPage - 1
          )
        }
        disabled={currentPage === 1}
        className="
          px-4
          py-2
          rounded-xl
          border
          border-zinc-800
          bg-zinc-950
          text-sm
          disabled:opacity-40
          hover:bg-zinc-900
          transition
        "
      >
        Previous
      </button>

      {/* PAGE NUMBERS */}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() =>
            onPageChange(page)
          }
          className={`
            w-10
            h-10
            rounded-xl
            text-sm
            transition
            ${
              currentPage === page
                ? "bg-white text-black font-bold"
                : "bg-zinc-950 border border-zinc-800 hover:bg-zinc-900"
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* NEXT */}

      <button
        onClick={() =>
          onPageChange(
            currentPage + 1
          )
        }
        disabled={
          currentPage ===
          totalPages
        }
        className="
          px-4
          py-2
          rounded-xl
          border
          border-zinc-800
          bg-zinc-950
          text-sm
          disabled:opacity-40
          hover:bg-zinc-900
          transition
        "
      >
        Next
      </button>
    </div>
  );
}