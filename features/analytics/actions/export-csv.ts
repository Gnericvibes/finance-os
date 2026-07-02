"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { db } from "@/lib/db";

import { EntryType } from "@prisma/client";

/*
 -----------------------------------
 EXPORT CSV
 -----------------------------------
*/

export async function exportCsv(
  type: string
) {
  /*
   -----------------------------------
   SESSION
   -----------------------------------
  */

  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user) {
    throw new Error(
      "Unauthorized"
    );
  }

  /*
   -----------------------------------
   TYPE MAP
   -----------------------------------
  */

  const typeMap: Record<
    string,
    EntryType
  > = {
    income: EntryType.INCOME,

    expenses: EntryType.EXPENSE,

    investments:
      EntryType.INVESTMENT,

    "debt-payment":
      EntryType.DEBT_PAYMENT,

    transfer: EntryType.TRANSFER,
  };

  const entryType =
    typeMap[type];

  if (!entryType) {
    throw new Error(
      "Invalid type"
    );
  }

  /*
   -----------------------------------
   FETCH ENTRIES
   -----------------------------------
  */

    const entries = await db.entry.findMany({
    where: {
      userId: session.user.id,

      type: entryType,
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });


  /*
   -----------------------------------
   CSV HEADERS
   -----------------------------------
  */

  const headersRow = [
    "Title",
    "Category",
    "Amount",
    "Type",
    "Date",
  ];

  /*
   -----------------------------------
   CSV ROWS
   -----------------------------------
  */

    const rows = entries.map((entry) => [
    entry.title,

    entry.category?.name ?? "Uncategorized",

    Number(entry.amount),

    entry.type,

    new Date(entry.createdAt).toLocaleDateString(),
  ]);


  /*
   -----------------------------------
   BUILD CSV
   -----------------------------------
  */

  const csv = [
    headersRow.join(","),

    ...rows.map((row) =>
      row.join(",")
    ),
  ].join("\n");

  return csv;
}