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
        const debtPayments = DashboardEngine.getDebtPayments(engineEntries);
        const totalOutflow = DashboardEngine.getTotalOutflow(engineEntries);
        const cashFlow = DashboardEngine.getCashFlow(engineEntries);
        const savingsRate = DashboardEngine.getSavingsRate(engineEntries);

        /*
         -----------------------------------
         EXPENSE BREAKDOWN
         -----------------------------------
        */

        const expenseBreakdown = DashboardEngine.getExpenseBreakdown(engineEntries);

        /*
         -----------------------------------
         BUDGET ALLOCATION COMPARISON
         -----------------------------------
        */

        const totalOperationalBudget = blueprint
          ? Number(blueprint.operationalAllocation)
          : 0;

        // Live-recompute recommended amounts from HouseholdExpenseProfile
        const expenseProfile = await db.householdExpenseProfile.findUnique({
          where: { userId },
        });

        const statedExpenses: { category: string; amount: number }[] = [
          { category: "Housing", amount: Number(expenseProfile?.rentHousing ?? 0) },
          { category: "Food", amount: Number(expenseProfile?.food ?? 0) },
          { category: "Transportation", amount: Number(expenseProfile?.transport ?? 0) },
          { category: "Utilities", amount: Number(expenseProfile?.utilities ?? 0) },
          { category: "Healthcare", amount: Number(expenseProfile?.healthCare ?? 0) },
          { category: "Education", amount: Number(expenseProfile?.schoolFees ?? 0) },
          { category: "Lifestyle", amount: Number(expenseProfile?.subscriptions ?? 0) },
          { category: "Misc", amount: Number(expenseProfile?.miscellaneousExpenses ?? 0) },
        ];

        const totalStated = statedExpenses.reduce((s, e) => s + e.amount, 0);

        let allocationData: { category: string; recommended: number; percentage: number }[] = [];

        if (totalStated > 0 && totalOperationalBudget > 0) {
          const allocatableBudget = totalOperationalBudget * 0.9;

          if (totalStated <= allocatableBudget) {
            allocationData = statedExpenses.map((exp) => ({
              category: exp.category,
              recommended: Math.round(exp.amount),
              percentage: totalOperationalBudget > 0 ? Math.round(exp.amount) / totalOperationalBudget : 0,
            }));
          } else {
            allocationData = statedExpenses.map((exp) => {
              const userRatio = exp.amount / totalStated;
              const recommended = Math.round(allocatableBudget * userRatio);
              return {
                category: exp.category,
                recommended,
                percentage: recommended / totalOperationalBudget,
              };
            });
          }

          const allocatedSum = allocationData.reduce((s, a) => s + a.recommended, 0);
          const bufferRemaining = totalOperationalBudget > allocatedSum ? totalOperationalBudget - allocatedSum : 0;
          if (bufferRemaining > 0) {
            allocationData.push({
              category: "Emergency",
              recommended: Math.round(bufferRemaining * 0.25),
              percentage: (bufferRemaining * 0.25) / totalOperationalBudget,
            });
            allocationData.push({
              category: "Family",
              recommended: Math.round(bufferRemaining * 0.75),
              percentage: (bufferRemaining * 0.75) / totalOperationalBudget,
            });
          }
        }

        const budgetAllocations = await db.budgetAllocation.findMany({
          where: { userId },
        });

        const allocationComparisons =
          allocationData.length > 0
            ? DashboardEngine.compareWithAllocations(
                expenseBreakdown,
                allocationData,
                totalOperationalBudget
              )
            : budgetAllocations.length > 0
              ? DashboardEngine.compareWithAllocations(
                  expenseBreakdown,
                  budgetAllocations.map((a) => ({
                    category: a.category,
                    recommended: Number(a.recommended),
                    percentage: a.percentage,
                  })),
                  totalOperationalBudget
                )
              : [];

        const allocationAlerts =
          DashboardEngine.generateAllocationAlerts(allocationComparisons);

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
      allocationComparisons,
            allocationAlerts,
    };
  }
}