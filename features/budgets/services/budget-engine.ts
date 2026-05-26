interface BudgetCategoryData {
  category: string;
  limitAmount: number;
}

interface EntryData {
  category: string;
  amount: number;
  type: string;
}

export class BudgetEngine {
  /*
   -----------------------------------
   CATEGORY SPENDING
   -----------------------------------
  */

  static getCategorySpending(
    entries: EntryData[],
    category: string
  ) {
    return entries
      .filter(
        (entry) =>
          entry.type === "EXPENSE" &&
          entry.category === category
      )
      .reduce(
        (total, entry) =>
          total + entry.amount,
        0
      );
  }

  /*
   -----------------------------------
   BUDGET STATUS
   -----------------------------------
  */

  static getBudgetStatus(
    limitAmount: number,
    spent: number
  ) {
    const remaining =
      limitAmount - spent;

    const percentage =
      limitAmount === 0
        ? 0
        : Math.round(
            (spent / limitAmount) *
              100
          );

    let status = "GOOD";

    if (percentage >= 100) {
      status = "OVER_BUDGET";
    } else if (percentage >= 80) {
      status = "WARNING";
    }

    return {
      spent,
      remaining,
      percentage,
      status,
    };
  }

  /*
   -----------------------------------
   FULL BUDGET ANALYSIS
   -----------------------------------
  */

  static analyzeBudget(
    categories: BudgetCategoryData[],
    entries: EntryData[]
  ) {
    return categories.map(
      (category) => {
        const spent =
          this.getCategorySpending(
            entries,
            category.category
          );

        const analysis =
          this.getBudgetStatus(
            category.limitAmount,
            spent
          );

        return {
          category:
            category.category,

          limit:
            category.limitAmount,

          ...analysis,
        };
      }
    );
  }
}