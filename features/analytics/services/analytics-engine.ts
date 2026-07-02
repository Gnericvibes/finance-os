import { EntryType } from "@prisma/client";

export interface EntryData {
  id: string;
  type: EntryType;
  title: string;
  amount: number;
  category: string;
  createdAt: Date;
}

export class AnalyticsEngine {
  /*
   -----------------------------------
   FILTER ENTRIES
   -----------------------------------
  */

  static filterByType(
    entries: EntryData[],
    type: EntryType
  ) {
    return entries.filter(
      (entry) => entry.type === type
    );
  }

  /*
   -----------------------------------
   TOTAL
   -----------------------------------
  */

  static getTotal(
    entries: EntryData[]
  ) {
    return entries.reduce(
      (acc, entry) =>
        acc + entry.amount,
      0
    );
  }

  /*
   -----------------------------------
   CATEGORY BREAKDOWN
   -----------------------------------
  */

  static getCategoryBreakdown(
    entries: EntryData[]
  ) {
    const map = new Map<
      string,
      number
    >();

    entries.forEach((entry) => {
      const current =
        map.get(
          entry.category
        ) || 0;

      map.set(
        entry.category,
        current + entry.amount
      );
    });

    return Array.from(
      map.entries()
    ).map(([category, amount]) => ({
      category,
      amount,
    }));
  }

  /*
   -----------------------------------
   MONTHLY TREND
   -----------------------------------
  */

  static getMonthlyTrend(
    entries: EntryData[]
  ) {
    const map = new Map<
      string,
      number
    >();

    entries.forEach((entry) => {
      const date = new Date(
        entry.createdAt
      );

      const month =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

      const current =
        map.get(month) || 0;

      map.set(
        month,
        current + entry.amount
      );
    });

    return Array.from(
      map.entries()
    )
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([month, total]) => ({
        month,
        total,
      }));
  }

  /*
   -----------------------------------
   LARGEST TRANSACTIONS
   -----------------------------------
  */

  static getLargestTransactions(
    entries: EntryData[]
  ) {
    return [...entries]
      .sort(
        (a, b) =>
          b.amount - a.amount
      )
      .slice(0, 5);
  }

  /*
   -----------------------------------
   AVERAGE TRANSACTION
   -----------------------------------
  */

  static getAverageTransaction(
    entries: EntryData[]
  ) {
    if (entries.length === 0) {
      return 0;
    }

    return Number(
      (
        this.getTotal(entries) /
        entries.length
      ).toFixed(2)
    );
  }
}