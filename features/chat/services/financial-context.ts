import { db } from "@/lib/db";

import { DashboardEngine } from "@/features/dashboard/services/dashboard-engine";

import { BudgetEngine } from "@/features/budgets/services/budget-engine";

export class FinancialContext {
  static async build(
    userId: string
  ) {
    /*
     -----------------------------------
     FETCH PROFILE
     -----------------------------------
    */

    const profile =
      await db.profile.findUnique({
        where: {
          userId,
        },
      });

    /*
     -----------------------------------
     FETCH BLUEPRINT
     -----------------------------------
    */

    const blueprint =
      await db.pFOSBlueprint.findUnique({
        where: {
          userId,
        },
      });

    /*
     -----------------------------------
     FETCH ENTRIES
     -----------------------------------
    */

    const entries =
      await db.entry.findMany({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    /*
     -----------------------------------
     FETCH BUDGET
     -----------------------------------
    */

    const budget =
      await db.budget.findFirst({
        where: {
          userId,
        },

        include: {
          categories: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    /*
     -----------------------------------
     DASHBOARD ANALYTICS
     -----------------------------------
    */

    const income =
      DashboardEngine.getIncome(
        entries
      );

    const expenses =
      DashboardEngine.getExpenses(
        entries
      );

    const investments =
      DashboardEngine.getInvestments(
        entries
      );

    const cashFlow =
      DashboardEngine.getCashFlow(
        entries
      );

    const savingsRate =
      DashboardEngine.getSavingsRate(
        entries
      );

    /*
     -----------------------------------
     BUDGET ANALYSIS
     -----------------------------------
    */

    let budgetAnalysis: any[] = [];

    if (budget) {
      budgetAnalysis =
        BudgetEngine.analyzeBudget(
          budget.categories,
          entries
        );
    }

    /*
     -----------------------------------
     BUILD CONTEXT
     -----------------------------------
    */

    return {
      profile,

      blueprint,

      analytics: {
        income,
        expenses,
        investments,
        cashFlow,
        savingsRate,
      },

      budgets: budgetAnalysis,
    };
  }
}