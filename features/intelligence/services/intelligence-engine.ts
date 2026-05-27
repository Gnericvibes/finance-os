interface Entry {
  amount: number;

  category: string;

  createdAt: Date;

  title: string;
}

export class IntelligenceEngine {
  /*
   -----------------------------------
   DETECT LARGE EXPENSES
   -----------------------------------
  */

  static detectLargeExpenses(
    entries: Entry[]
  ) {
    return entries.filter(
      (entry) =>
        entry.amount >= 100000
    );
  }

  /*
   -----------------------------------
   DETECT SPENDING SPIKES
   -----------------------------------
  */

  static detectSpendingSpike(
    current: number,
    previous: number
  ) {
    if (previous === 0)
      return false;

    const increase =
      ((current - previous) /
        previous) *
      100;

    return increase >= 40;
  }

  /*
   -----------------------------------
   TOP CATEGORY
   -----------------------------------
  */

  static getTopCategory(
    entries: Entry[]
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

    let topCategory =
      "Unknown";

    let topAmount = 0;

    map.forEach(
      (
        amount,
        category
      ) => {
        if (
          amount > topAmount
        ) {
          topAmount =
            amount;

          topCategory =
            category;
        }
      }
    );

    return {
      category:
        topCategory,

      amount: topAmount,
    };
  }

  /*
   -----------------------------------
   DETECT RECURRING
   -----------------------------------
  */

  static detectRecurringPayments(
    entries: Entry[]
  ) {
    const map = new Map<
      string,
      number
    >();

    entries.forEach((entry) => {
      const current =
        map.get(
          entry.title
        ) || 0;

      map.set(
        entry.title,
        current + 1
      );
    });

    return Array.from(
      map.entries()
    )
      .filter(
        ([_, count]) =>
          count >= 3
      )
      .map(([title]) => title);
  }

  /*
   -----------------------------------
   GENERATE INSIGHTS
   -----------------------------------
  */

  static generateInsights({
    entries,
    currentTotal,
    previousTotal,
  }: {
    entries: Entry[];

    currentTotal: number;

    previousTotal: number;
  }) {
    const insights: string[] =
      [];

    /*
     -----------------------------------
     SPIKE DETECTION
     -----------------------------------
    */

    const spike =
      this.detectSpendingSpike(
        currentTotal,
        previousTotal
      );

    if (spike) {
      insights.push(
        "Spending increased significantly compared to the previous period."
      );
    }

    /*
     -----------------------------------
     TOP CATEGORY
     -----------------------------------
    */

    const topCategory =
      this.getTopCategory(
        entries
      );

    insights.push(
      `${topCategory.category} is currently the highest spending category.`
    );

    /*
     -----------------------------------
     LARGE EXPENSES
     -----------------------------------
    */

    const largeExpenses =
      this.detectLargeExpenses(
        entries
      );

    if (
      largeExpenses.length > 0
    ) {
      insights.push(
        `${largeExpenses.length} unusually large transactions detected.`
      );
    }

    /*
     -----------------------------------
     RECURRING
     -----------------------------------
    */

    const recurring =
      this.detectRecurringPayments(
        entries
      );

    if (
      recurring.length > 0
    ) {
      insights.push(
        `Recurring payments detected: ${recurring.join(
          ", "
        )}.`
      );
    }

    return insights;
  }
}