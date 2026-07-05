import {
  PFOSEngine,
  type ProfileInput,
} from "@/features/pfos/services/pfos-engine";

export type DashboardEntry = {
  type: string;
  amount: number;
  category: string;
};

export type AllocationComparison = {
  category: string;
  recommended: number;
  actual: number;
  percentage: number;
  recommendedPercentage: number;
  difference: number;
  differencePercentage: number;
  status: "UNDER" | "ON_TRACK" | "OVER" | "CRITICAL";
};

export class DashboardEngine {
  static getBlueprintMode(profile: ProfileInput) {
    return PFOSEngine.detectBlueprintMode(profile);
  }

  static getFinancialHealthScore(profile: ProfileInput) {
    return PFOSEngine.calculateFinancialHealthScore(profile);
  }

    /*
   -----------------------------------
   TOTAL INCOME
   -----------------------------------
  */

  static getIncome(entries: DashboardEntry[]) {
    return entries
      .filter((entry) => entry.type === "INCOME")
      .reduce((total, entry) => total + entry.amount, 0);
  }

  /*
   -----------------------------------
   TOTAL EXPENSES
   -----------------------------------
  */

    static getExpenses(entries: DashboardEntry[]) {
    return entries
      .filter(
        (entry) => entry.type === "EXPENSE"
      )
      .reduce((total, entry) => total + entry.amount, 0);
  }

  /*
   -----------------------------------
   TOTAL INVESTMENTS
   -----------------------------------
  */

  static getInvestments(entries: DashboardEntry[]) {
    return entries
      .filter((entry) => entry.type === "INVESTMENT")
      .reduce((total, entry) => total + entry.amount, 0);
  }

  /*
   -----------------------------------
   TOTAL DEBT PAYMENTS
   -----------------------------------
  */

  static getDebtPayments(entries: DashboardEntry[]) {
    return entries
      .filter((entry) => entry.type === "DEBT_PAYMENT")
      .reduce((total, entry) => total + entry.amount, 0);
  }

  /*
   -----------------------------------
   TOTAL OUTFLOW
   All money leaving the account
   -----------------------------------
  */

  static getTotalOutflow(entries: DashboardEntry[]) {
    return (
      this.getExpenses(entries) +
      this.getDebtPayments(entries) +
      this.getInvestments(entries)
    );
  }

  /*
   -----------------------------------
   CASH FLOW
   Income minus all outflows
   -----------------------------------
  */

  static getCashFlow(entries: DashboardEntry[]) {
    const income = this.getIncome(entries);
    const outflow = this.getTotalOutflow(entries);

    return income - outflow;
  }

  /*
   -----------------------------------
   SAVINGS RATE
   What percentage of income is retained after all outflows
   -----------------------------------
  */

  static getSavingsRate(entries: DashboardEntry[]) {
    const income = this.getIncome(entries);
    const outflow = this.getTotalOutflow(entries);

    if (income <= 0) return 0;

    const savings = income - outflow;

    return Number(((savings / income) * 100).toFixed(1));
  }

  /*
   -----------------------------------
   EXPENSE BREAKDOWN
   -----------------------------------
  */

    static getExpenseBreakdown(entries: DashboardEntry[]) {
    const expenses = entries.filter(
      (entry) => entry.type === "EXPENSE"
    );

    const totalExpenses = expenses.reduce(
      (total, entry) => total + entry.amount,
      0
    );

    const categoryMap = new Map<string, number>();

    expenses.forEach((entry) => {
      const current = categoryMap.get(entry.category) || 0;
      categoryMap.set(entry.category, current + entry.amount);
    });

        return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpenses > 0
          ? Number(((amount / totalExpenses) * 100).toFixed(1))
          : 0,
    }));
  }

  /*
   -----------------------------------
   ACTUAL vs BUDGET ALLOCATION COMPARISON
   -----------------------------------
  */

    /*
   -----------------------------------
   CATEGORY NAME MAPPING
   Maps user-facing entry categories to canonical budget allocation categories
   -----------------------------------
  */

    static readonly CATEGORY_MAP: Record<string, string[]> = {
    Housing: ["rent / housing", "rent", "housing", "rent/housing", "accommodation", "mortgage", "property"],
    Food: ["food & groceries", "food", "groceries", "food and groceries", "dining", "restaurant", "eating out", "meal"],
    Transportation: ["transport", "transportation", "gas", "fuel", "uber", "lyft", "taxi", "bus", "transit", "car", "parking"],
    Utilities: ["utilities", "electricity", "electric", "water", "internet", "phone", "gas bill", "cable"],
    Healthcare: ["healthcare", "health", "medical", "doctor", "hospital", "insurance", "pharmacy", "medicine", "dentist"],
    Lifestyle: ["lifestyle", "entertainment", "dining", "restaurant", "shopping", "clothing", "travel", "leisure", "hobby", "gym"],
    Emergency: ["emergency", "unexpected", "repair", "maintenance", "car repair", "home repair"],
    Education: ["education", "school fees", "school", "tuition", "course", "training", "books", "university", "college"],
    Family: ["family", "family support", "children", "childcare", "dependents", "baby", "kids"],
    Misc: ["miscellaneous", "misc", "other", "uncategorized", "general", "subscriptions", "membership"],
  };

  static compareWithAllocations(
    expenseBreakdown: { category: string; amount: number; percentage: number }[],
    allocations: { category: string; recommended: number; percentage: number }[],
    totalOperationalBudget: number
  ): AllocationComparison[] {
    // Build a map of actual spending by canonical category name
    const actualMap = new Map<string, number>();
    for (const item of expenseBreakdown) {
      const normalized = item.category.toLowerCase().trim();
      actualMap.set(normalized, item.amount);
    }

    // Also try fuzzy matching for categories that aren't exact matches
    function findActualForAlloc(allocCategory: string): number {
      const lower = allocCategory.toLowerCase();

      // Direct match
      if (actualMap.has(lower)) {
        return actualMap.get(lower)!;
      }

      // Check mapped aliases
      const aliases = DashboardEngine.CATEGORY_MAP[allocCategory];
      if (aliases) {
        for (const alias of aliases) {
          if (actualMap.has(alias)) {
            return actualMap.get(alias)!;
          }
          // Check if any key in actualMap contains the alias or vice versa
          for (const [key, value] of actualMap) {
            if (key.includes(alias) || alias.includes(key)) {
              return value;
            }
          }
        }
      }

      // Partial match: check if any actual key contains the budget category name
      for (const [key, value] of actualMap) {
        if (key.includes(lower) || lower.includes(key)) {
          return value;
        }
      }

      return 0;
    }

    return allocations.map((alloc) => {
      const actual = findActualForAlloc(alloc.category);
      const recommended = alloc.recommended;
      const difference = actual - recommended;
      const differencePercentage = recommended > 0
        ? Number(((difference / recommended) * 100).toFixed(1))
        : actual > 0 ? 100 : 0;

      let status: AllocationComparison["status"] = "ON_TRACK";

      if (differencePercentage >= 50) {
        status = "CRITICAL";
      } else if (differencePercentage >= 20) {
        status = "OVER";
      } else if (differencePercentage <= -20) {
        status = "UNDER";
      }

      return {
        category: alloc.category,
        recommended,
        actual,
        percentage: totalOperationalBudget > 0
          ? Number(((actual / totalOperationalBudget) * 100).toFixed(1))
          : 0,
        recommendedPercentage: alloc.percentage * 100,
        difference,
        differencePercentage,
        status,
      };
    });
  }

  /*
   -----------------------------------
   GENERATE ALLOCATION ALERTS
   -----------------------------------
  */

    /*
   -----------------------------------
   SYNC ALLOCATION ACTUALS FROM ENTRIES
   Updates the actual field on BudgetAllocation records
   -----------------------------------
  */

  static async refreshAllocationActuals(
    userId: string,
    entries: DashboardEntry[]
  ) {
    const { db } = await import("@/lib/db");

    const expenseBreakdown = this.getExpenseBreakdown(entries);

    const allocations = await db.budgetAllocation.findMany({
      where: { userId },
    });

    const comparison = this.compareWithAllocations(
      expenseBreakdown,
      allocations.map((a) => ({
        category: a.category,
        recommended: Number(a.recommended),
        percentage: a.percentage,
      })),
      1 // totalOperationalBudget not needed here; we just need actual amounts
    );

    for (const item of comparison) {
      await db.budgetAllocation.updateMany({
        where: { userId, category: item.category },
        data: { actual: item.actual },
      });
    }
  }

  static generateAllocationAlerts(
    comparisons: AllocationComparison[]
  ): string[] {
    const alerts: string[] = [];

    for (const item of comparisons) {
      if (item.status === "CRITICAL") {
        alerts.push(
          `${item.category} overspent by ${item.differencePercentage}% above budget allocation (₦${Math.abs(item.difference).toLocaleString()}).`
        );
      } else if (item.status === "OVER") {
        alerts.push(
          `${item.category} spending is ${item.differencePercentage}% above the recommended allocation.`
        );
      }
    }

    return alerts;
  }
}