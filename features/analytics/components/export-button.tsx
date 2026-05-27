"use client";

import { useState } from "react";

import { exportCsv } from "@/features/analytics/actions/export-csv";

interface ExportButtonProps {
  type: string;
}

export function ExportButton({
  type,
}: ExportButtonProps) {
  /*
   -----------------------------------
   STATE
   -----------------------------------
  */

  const [loading, setLoading] =
    useState(false);

  /*
   -----------------------------------
   DOWNLOAD CSV
   -----------------------------------
  */

  async function handleExport() {
    try {
      setLoading(true);

      const csv =
        await exportCsv(type);

      /*
       -----------------------------------
       CREATE FILE
       -----------------------------------
      */

      const blob = new Blob(
        [csv],
        {
          type: "text/csv",
        }
      );

      const url =
        URL.createObjectURL(blob);

      /*
       -----------------------------------
       DOWNLOAD
       -----------------------------------
      */

      const a =
        document.createElement("a");

      a.href = url;

      a.download = `${type}-analytics.csv`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to export CSV"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   -----------------------------------
   UI
   -----------------------------------
  */

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="
        px-5
        py-3
        rounded-2xl
        bg-white
        text-black
        font-semibold
        hover:opacity-90
        transition
        disabled:opacity-50
      "
    >
      {loading
        ? "Exporting..."
        : "Export CSV"}
    </button>
  );
}