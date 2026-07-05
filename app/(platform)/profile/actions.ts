"use server";

import { db } from "@/lib/db";
import { retryTransaction } from "@/lib/retry-transaction";
import { getCurrentUser } from "@/lib/current-user";
import { PFOSEngine } from "@/features/pfos/services/pfos-engine";
import { DashboardEngine } from "@/features/dashboard/services/dashboard-engine";

import type {
  EmploymentType,
  IncomeFrequency,
  FinancialGoal,
  MaritalStatus,
} from "@prisma/client";

export async function updateFinancialProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const userId = user.id;

  const fullName = formData.get("fullName") as string;
  const employmentType = formData.get("employmentType") as EmploymentType;
  const maritalStatus = formData.get("maritalStatus") as MaritalStatus;
  const hasDependents = formData.get("hasDependents") === "true";
  const dependentsCount = Number(formData.get("dependentsCount") ?? 0);
  const currency = formData.get("currency") as string;
  const monthlyIncome = Number(formData.get("monthlyIncome") ?? 0);
  const additionalIncome = Number(formData.get("additionalIncome") ?? 0);
  const incomeFrequency = formData.get("incomeFrequency") as IncomeFrequency;
    const hasDebt = formData.get("hasDebt") === "true";
  const totalDebt = Number(formData.get("totalDebt") ?? 0);
  const repaymentAmount = Number(formData.get("repaymentAmount") ?? 0);
  const debtDueDateStr = formData.get("debtDueDate") as string;
  const debtDueDate = debtDueDateStr ? new Date(debtDueDateStr) : null;
  const mainFinancialGoal = formData.get("mainFinancialGoal") as FinancialGoal;
  const emergencySavingsGoal = Number(formData.get("emergencySavingsGoal") ?? 0);
  const interestedInInvesting = formData.get("interestedInInvesting") === "true";

    // Update the financial profile
  await db.financialProfile.update({
    where: { userId },
    data: {
      fullName,
      employmentType,
      maritalStatus,
      hasDependents,
      dependentsCount,
      currency,
      monthlyIncome,
      additionalIncome,
      incomeFrequency,
      hasDebt,
      totalDebt,
      repaymentAmount,
      debtDueDate,
      mainFinancialGoal,
      emergencySavingsGoal,
      interestedInInvesting,
    },
  });

  // Get expense profile for blueprint generation
  const expenseProfile = await db.householdExpenseProfile.findUnique({
    where: { userId },
  });

  // Generate new blueprint
  const blueprint = PFOSEngine.generateBlueprint({
    monthlyIncome,
    totalDebt,
    repaymentAmount,
    rentHousing: Number(expenseProfile?.rentHousing ?? 0),
    food: Number(expenseProfile?.food ?? 0),
    transport: Number(expenseProfile?.transport ?? 0),
    utilities: Number(expenseProfile?.utilities ?? 0),
    schoolFees: Number(expenseProfile?.schoolFees ?? 0),
    subscriptions: Number(expenseProfile?.subscriptions ?? 0),
    healthCare: Number(expenseProfile?.healthCare ?? 0),
    miscellaneousExpenses: Number(expenseProfile?.miscellaneousExpenses ?? 0),
    dependentsCount,
  });

    await retryTransaction(async (tx) => {
    await tx.financialBlueprint.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const latestBlueprint = await tx.financialBlueprint.findFirst({
      where: { userId },
      orderBy: { version: "desc" },
    });

    const nextVersion = (latestBlueprint?.version ?? 0) + 1;

    await tx.financialBlueprint.create({
      data: {
        userId,
        version: nextVersion,
        isActive: true,
        operationalAllocation: blueprint.operationalAllocation,
        debtAllocation: blueprint.debtAllocation,
        investmentAllocation: blueprint.investmentAllocation,
        emergencyAllocation: blueprint.emergencyAllocation,
        operationalPercentage: blueprint.operationalPercentage,
        debtPercentage: blueprint.debtPercentage,
        investmentPercentage: blueprint.investmentPercentage,
        emergencyPercentage: blueprint.emergencyPercentage,
        financialHealthScore: blueprint.financialHealthScore,
        blueprintMode: blueprint.blueprintMode,
        isDebtFree: blueprint.isDebtFree,
        interpretation: `Recomputed after profile update (${blueprint.blueprintMode})`,
      },
    });
  });

    // Sync BudgetAllocation.recommended to match the new operational budget
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
  const newOpBudget = Number(blueprint.operationalAllocation);

  if (totalStated > 0 && newOpBudget > 0) {
    const allocatableBudget = newOpBudget * 0.9;

    let updatedAllocations: { category: string; recommended: number }[];

    if (totalStated <= allocatableBudget) {
      // Use stated amounts directly
      updatedAllocations = statedExpenses.map((exp) => ({
        category: exp.category,
        recommended: Math.round(exp.amount),
      }));
    } else {
      // Scale down proportionally
      updatedAllocations = statedExpenses.map((exp) => {
        const userRatio = exp.amount / totalStated;
        return {
          category: exp.category,
          recommended: Math.round(allocatableBudget * userRatio),
        };
      });
    }

    for (const item of updatedAllocations) {
      await db.budgetAllocation.updateMany({
        where: { userId, category: item.category },
        data: {
          recommended: item.recommended,
          percentage: newOpBudget > 0 ? item.recommended / newOpBudget : 0,
        },
      });
    }

    const allocatedSum = updatedAllocations.reduce((s, a) => s + a.recommended, 0);
    const bufferRemaining = newOpBudget > allocatedSum ? newOpBudget - allocatedSum : 0;

    if (bufferRemaining > 0) {
      await db.budgetAllocation.updateMany({
        where: { userId, category: "Emergency" },
        data: { recommended: Math.round(bufferRemaining * 0.25) },
      });
      await db.budgetAllocation.updateMany({
        where: { userId, category: "Family" },
        data: { recommended: Math.round(bufferRemaining * 0.75) },
      });
    }
  }

  return { success: true };
}
