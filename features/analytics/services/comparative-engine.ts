interface Entry {
  amount: number;

  createdAt: Date;
}

export class ComparativeEngine {
  /*
   -----------------------------------
   CURRENT PERIOD TOTAL
   -----------------------------------
  */

  static getCurrentTotal(
    entries: Entry[]
  ) {
    return entries.reduce(
      (acc, entry) =>
        acc + entry.amount,
      0
    );
  }

  /*
   -----------------------------------
   PREVIOUS PERIOD TOTAL
   -----------------------------------
  */

  static getPreviousTotal(
    previousEntries: Entry[]
  ) {
    return previousEntries.reduce(
      (acc, entry) =>
        acc + entry.amount,
      0
    );
  }

  /*
   -----------------------------------
   PERCENT CHANGE
   -----------------------------------
  */

  static getPercentageChange(
    current: number,
    previous: number
  ) {
    if (previous === 0) {
      return 100;
    }

    return Number(
      (
        ((current - previous) /
          previous) *
        100
      ).toFixed(1)
    );
  }

  /*
   -----------------------------------
   TREND TYPE
   -----------------------------------
  */

  static getTrend(
    percentage: number
  ) {
    if (percentage > 0)
      return "up";

    if (percentage < 0)
      return "down";

    return "neutral";
  }
}