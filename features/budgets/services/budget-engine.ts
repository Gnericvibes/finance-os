interface BudgetCategoryData {
  category: string;

  limitAmount: number;
}

interface EntryData {
  category: string;

  amount: number;

  type: string;
}

interface PFOSData {
  operationalPercentage: number;

  debtPercentage: number;

  emergencyPercentage: number;

  investmentPercentage: number;
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
  ): number {
    return entries
      .filter(
        (entry) =>
          entry.type === "EXPENSE" &&
          entry.category.toLowerCase() ===
            category.toLowerCase()
      )
      .reduce(
        (
          total,
          entry
        ) => total + entry.amount,
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
   CATEGORY RISK SCORE
   -----------------------------------
  */

  static getRiskLevel(
    percentage: number
  ) {
    if (percentage >= 120) {
      return "CRITICAL";
    }

    if (percentage >= 100) {
      return "HIGH";
    }

    if (percentage >= 80) {
      return "MEDIUM";
    }

    return "LOW";
  }

  /*
   -----------------------------------
   BUDGET ALERTS
   -----------------------------------
  */

  static generateAlerts(
    category: string,
    percentage: number,
    remaining: number
  ): string[] {
    const alerts: string[] = [];

    if (percentage >= 120) {
      alerts.push(
        `${category} spending is critically above budget.`
      );
    }

    else if (percentage >= 100) {
      alerts.push(
        `${category} budget exceeded.`
      );
    }

    else if (percentage >= 80) {
      alerts.push(
        `${category} budget approaching limit.`
      );
    }

    if (remaining < 0) {
      alerts.push(
        `Overspent by ₦${Math.abs(
          remaining
        ).toLocaleString()}`
      );
    }

    return alerts;
  }

  /*
   -----------------------------------
   PFOS CATEGORY MAPPING
   -----------------------------------
  */

  static getPFOSBucket(
    category: string
  ) {
    const lower =
      category.toLowerCase();

    if (
      [
        "food",
        "transport",
        "rent",
        "utilities",
        "health",
      ].includes(lower)
    ) {
      return "SURVIVAL";
    }

    if (
      [
        "debt",
        "loan",
      ].includes(lower)
    ) {
      return "DEBT";
    }

    if (
      [
        "savings",
        "emergency",
      ].includes(lower)
    ) {
      return "EMERGENCY";
    }

    if (
      [
        "investment",
        "stocks",
        "crypto",
      ].includes(lower)
    ) {
      return "INVESTMENT";
    }

    return "LIFESTYLE";
  }

  /*
   -----------------------------------
   PFOS ALLOCATION CHECK
   -----------------------------------
  */

    static compareWithPFOS(
    percentage: number,
    bucket: string,
    blueprint: PFOSData
  ) {
    let allocation = 0;

    switch (bucket) {
      case "SURVIVAL":
      case "LIFESTYLE":
        allocation = blueprint.operationalPercentage;
        break;

      case "DEBT":
        allocation = blueprint.debtPercentage;
        break;

      case "EMERGENCY":
        allocation = blueprint.emergencyPercentage;
        break;

      case "INVESTMENT":
        allocation = blueprint.investmentPercentage;
        break;
    }

    return {
      bucket,
      recommendedAllocation: allocation,
      exceedsPFOS: percentage > allocation,
    };
  }


  /*
   -----------------------------------
   FULL BUDGET ANALYSIS
   -----------------------------------
  */

  static analyzeBudget(
    categories: BudgetCategoryData[],
    entries: EntryData[],
    blueprint?: PFOSData
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

        const riskLevel =
          this.getRiskLevel(
            analysis.percentage
          );

        const alerts =
          this.generateAlerts(
            category.category,
            analysis.percentage,
            analysis.remaining
          );

        const bucket =
          this.getPFOSBucket(
            category.category
          );

        const pfos =
          blueprint
            ? this.compareWithPFOS(
                analysis.percentage,
                bucket,
                blueprint
              )
            : null;

        return {
          category:
            category.category,

          limit:
            category.limitAmount,

          spent:
            analysis.spent,

          remaining:
            analysis.remaining,

          percentage:
            analysis.percentage,

          status:
            analysis.status,

          riskLevel,

          alerts,

          pfos,
        };
      }
    );
  }
}