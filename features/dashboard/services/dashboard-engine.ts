import {
  PFOSEngine,
  type ProfileInput,
} from "@/features/pfos/services/pfos-engine";

export type DashboardEntry = {
  type: string;
  amount: number;
  category: string;
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
        (entry) =>
          entry.type === "EXPENSE" || entry.type === "DEBT_PAYMENT"
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
   CASH FLOW
   -----------------------------------
  */

  static getCashFlow(entries: DashboardEntry[]) {
    const income = this.getIncome(entries);
    const expenses = this.getExpenses(entries);

    return income - expenses;
  }

  /*
   -----------------------------------
   SAVINGS RATE
   -----------------------------------
  */

  static getSavingsRate(entries: DashboardEntry[]) {
    const income = this.getIncome(entries);
    const expenses = this.getExpenses(entries);

    if (income <= 0) return 0;

    const savings = income - expenses;

    return Number(((savings / income) * 100).toFixed(1));
  }

  /*
   -----------------------------------
   EXPENSE BREAKDOWN
   -----------------------------------
  */

  static getExpenseBreakdown(entries: DashboardEntry[]) {
    const expenses = entries.filter(
      (entry) => entry.type === "EXPENSE" || entry.type === "DEBT_PAYMENT"
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
}