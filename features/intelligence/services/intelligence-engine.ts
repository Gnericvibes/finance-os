import { EntryType } from "@prisma/client";

export interface EntryData {
  id: string;
  type: EntryType;
  title: string;
  amount: number;
  category: string;
  createdAt: Date;
}

interface InsightInput {
  entries: EntryData[];

  currentTotal: number;
  previousTotal: number;

  financialHealthScore?: number;
  blueprintMode?: string;
  savingsRate?: number;
  debtToIncomeRatio?: number;
  monthlyIncome?: number;
}

export class IntelligenceEngine {
  /*
   -----------------------------------
   SPENDING ENTRIES ONLY
   -----------------------------------
  */

  static getSpendingEntries(
    entries: EntryData[]
  ) {
    return entries.filter(
      (entry) =>
        entry.type === "EXPENSE" ||
        entry.type === "DEBT_PAYMENT"
    );
  }

  /*
   -----------------------------------
   LARGE EXPENSES
   -----------------------------------
  */

  static detectLargeExpenses(
    entries: EntryData[],
    monthlyIncome?: number
  ) {
    const spendingEntries =
      this.getSpendingEntries(entries);

    if (!monthlyIncome) {
      return spendingEntries.filter(
        (entry) =>
          entry.amount >= 100000
      );
    }

    return spendingEntries.filter(
      (entry) =>
        entry.amount >=
        monthlyIncome * 0.2
    );
  }

  /*
   -----------------------------------
   SPENDING SPIKE
   -----------------------------------
  */

  static detectSpendingSpike(
    current: number,
    previous: number
  ) {
    if (previous <= 0) {
      return {
        detected: false,
        percentage: 0,
      };
    }

    const percentage =
      ((current - previous) /
        previous) *
      100;

    return {
      detected: percentage >= 40,
      percentage: Number(
        percentage.toFixed(1)
      ),
    };
  }

  /*
   -----------------------------------
   TOP SPENDING CATEGORY
   -----------------------------------
  */

  static getTopCategory(
    entries: EntryData[]
  ) {
    const spendingEntries =
      this.getSpendingEntries(entries);

    const map = new Map<
      string,
      number
    >();

    spendingEntries.forEach(
      (entry) => {
        const current =
          map.get(
            entry.category
          ) || 0;

        map.set(
          entry.category,
          current + entry.amount
        );
      }
    );

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
   RECURRING PAYMENTS
   -----------------------------------
  */

  static detectRecurringPayments(
    entries: EntryData[]
  ) {
    const spendingEntries =
      this.getSpendingEntries(entries);

    const map = new Map<
      string,
      number
    >();

    spendingEntries.forEach(
      (entry) => {
        const normalized =
          entry.title
            .trim()
            .toLowerCase();

        const current =
          map.get(
            normalized
          ) || 0;

        map.set(
          normalized,
          current + 1
        );
      }
    );

    return Array.from(
      map.entries()
    )
      .filter(([, count]) => count >= 3)

      .map(([title]) => title);
  }

  /*
   -----------------------------------
   CATEGORY RISK
   -----------------------------------
  */

  static getCategoryRisk(
    entries: EntryData[]
  ) {
    const topCategory =
      this.getTopCategory(
        entries
      );

    const spendingTotal =
      this.getSpendingEntries(
        entries
      ).reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.amount,
        0
      );

    if (
      spendingTotal <= 0
    ) {
      return null;
    }

    const percentage =
      (
        (topCategory.amount /
          spendingTotal) *
        100
      ).toFixed(1);

    return {
      category:
        topCategory.category,
      percentage:
        Number(
          percentage
        ),
    };
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
    financialHealthScore,
    blueprintMode,
    savingsRate,
    debtToIncomeRatio,
    monthlyIncome,
  }: InsightInput) {
    const insights: string[] =
      [];

    /*
     -----------------------------------
     SPENDING SPIKE
     -----------------------------------
    */

    const spike =
      this.detectSpendingSpike(
        currentTotal,
        previousTotal
      );

    if (
      spike.detected
    ) {
      insights.push(
        `Spending increased by ${spike.percentage}% compared with the previous period.`
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
      `${topCategory.category} is currently your largest spending category.`
    );

    /*
     -----------------------------------
     CATEGORY CONCENTRATION
     -----------------------------------
    */

    const risk =
      this.getCategoryRisk(
        entries
      );

    if (
      risk &&
      risk.percentage >= 40
    ) {
      insights.push(
        `${risk.percentage}% of your spending is concentrated in ${risk.category}.`
      );
    }

    /*
     -----------------------------------
     LARGE EXPENSES
     -----------------------------------
    */

    const largeExpenses =
      this.detectLargeExpenses(
        entries,
        monthlyIncome
      );

    if (
      largeExpenses.length > 0
    ) {
      insights.push(
        `${largeExpenses.length} unusually large transactions were detected.`
      );
    }

    /*
     -----------------------------------
     RECURRING PAYMENTS
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

    /*
     -----------------------------------
     PFOS INSIGHTS
     -----------------------------------
    */

    if (
      blueprintMode
    ) {
      insights.push(
        `You are currently operating in ${blueprintMode} mode.`
      );
    }

    if (
      financialHealthScore !==
      undefined
    ) {
      if (
        financialHealthScore >=
        80
      ) {
        insights.push(
          "Financial health is strong and supports long-term wealth building."
        );
      } else if (
        financialHealthScore >=
        60
      ) {
        insights.push(
          "Financial health is stable but still has room for improvement."
        );
      } else {
        insights.push(
          "Financial health requires attention to improve long-term resilience."
        );
      }
    }

    if (
      savingsRate !==
        undefined &&
      savingsRate < 10
    ) {
      insights.push(
        "Savings rate is currently below recommended levels."
      );
    }

    if (
      debtToIncomeRatio !==
        undefined &&
      debtToIncomeRatio >
        35
    ) {
      insights.push(
        "Debt burden is relatively high compared to income."
      );
    }

    return insights;
  }
}