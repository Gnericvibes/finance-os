import { db } from "@/lib/db";

import {
  DashboardEngine,
  type DashboardEntry,
} from "@/features/dashboard/services/dashboard-engine";

import { BudgetEngine } from "@/features/budgets/services/budget-engine";

type BudgetAnalysis = ReturnType<typeof BudgetEngine.analyzeBudget>;

export class FinancialContext {
  static async build(userId: string) {
    /*
     -----------------------------------
     FETCH PROFILE
     -----------------------------------
    */

    const profile = await db.financialProfile.findUnique({
      where: {
        userId,
      },
    });

    /*
     -----------------------------------
     FETCH BLUEPRINT
     -----------------------------------
    */

        const blueprint = await db.financialBlueprint.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        version: "desc",
      },
    });


    const blueprintData = blueprint
      ? {
          operationalPercentage: blueprint.operationalPercentage,
          debtPercentage: blueprint.debtPercentage,
          emergencyPercentage: blueprint.emergencyPercentage,
          investmentPercentage: blueprint.investmentPercentage,
        }
      : undefined;

    /*
     -----------------------------------
     FETCH ENTRIES
     -----------------------------------
    */

    const entries = await db.entry.findMany({
      where: {
        userId,
      },

      include: {
        category: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const engineEntries: DashboardEntry[] = entries.map((entry) => ({
      type: entry.type,
      amount: Number(entry.amount),
      category: entry.category?.name ?? "Uncategorized",
    }));

    /*
     -----------------------------------
     FETCH BUDGET
     -----------------------------------
    */

    const budget = await db.budget.findFirst({
      where: {
        userId,
      },

      include: {
        categories: {
          include: {
            category: true,
          },
        },
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

    const income = DashboardEngine.getIncome(engineEntries);
    const expenses = DashboardEngine.getExpenses(engineEntries);
    const investments = DashboardEngine.getInvestments(engineEntries);
    const cashFlow = DashboardEngine.getCashFlow(engineEntries);
    const savingsRate = DashboardEngine.getSavingsRate(engineEntries);

    /*
     -----------------------------------
     BUDGET ANALYSIS
     -----------------------------------
    */

    let budgetAnalysis: BudgetAnalysis = [];

    if (budget) {
      budgetAnalysis = BudgetEngine.analyzeBudget(
        budget.categories.map((category) => ({
          category: category.category.name,
          limitAmount: Number(category.limitAmount),
        })),
        engineEntries,
        blueprintData
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