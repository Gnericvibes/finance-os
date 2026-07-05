import { db } from "@/lib/db";

import { loadUserFinancialData, computeAllocationData } from "@/lib/load-user-financial-data";

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
     BATCH LOAD ALL DATA (1 query group)
     -----------------------------------
    */

    const { profile, blueprint, expenseProfile, entryData } = await loadUserFinancialData(userId);

    /*
     -----------------------------------
     DASHBOARD ANALYTICS
     -----------------------------------
    */

    const income = DashboardEngine.getIncome(entryData);
    const expenses = DashboardEngine.getExpenses(entryData);
    const investments = DashboardEngine.getInvestments(entryData);
    const debtPayments = DashboardEngine.getDebtPayments(entryData);
    const totalOutflow = DashboardEngine.getTotalOutflow(entryData);
    const cashFlow = DashboardEngine.getCashFlow(entryData);
    const savingsRate = DashboardEngine.getSavingsRate(entryData);

    /*
     -----------------------------------
     EXPENSE BREAKDOWN
     -----------------------------------
    */

    const expenseBreakdown = DashboardEngine.getExpenseBreakdown(entryData);

    /*
     -----------------------------------
     BUDGET ALLOCATION COMPARISON
     -----------------------------------
    */

    const totalOperationalBudget = blueprint ? Number(blueprint.operationalAllocation) : 0;

    const allocationData = computeAllocationData(expenseProfile, totalOperationalBudget);

    const budgetAllocations = await db.budgetAllocation.findMany({
      where: { userId },
    });

    const allocationComparisons =
      allocationData.length > 0
        ? DashboardEngine.compareWithAllocations(expenseBreakdown, allocationData, totalOperationalBudget)
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

    const allocationAlerts = DashboardEngine.generateAllocationAlerts(allocationComparisons);

    /*
     -----------------------------------
     BUDGET ANALYSIS
     -----------------------------------
    */

    const budget = await db.budget.findFirst({
      where: { userId },
      include: {
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    let budgetAnalysis: BudgetAnalysis = [];

    if (budget) {
      const blueprintData = blueprint
        ? {
            operationalPercentage: blueprint.operationalPercentage,
            debtPercentage: blueprint.debtPercentage,
            emergencyPercentage: blueprint.emergencyPercentage,
            investmentPercentage: blueprint.investmentPercentage,
          }
        : undefined;

      budgetAnalysis = BudgetEngine.analyzeBudget(
        budget.categories.map((category) => ({
          category: category.category.name,
          limitAmount: Number(category.limitAmount),
        })),
        entryData,
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
      analytics: { income, expenses, investments, cashFlow, savingsRate },
      budgets: budgetAnalysis,
      allocationComparisons,
      allocationAlerts,
    };
  }
}