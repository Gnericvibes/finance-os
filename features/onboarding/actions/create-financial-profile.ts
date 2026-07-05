"use server";

import { db } from "@/lib/db";
import { retryTransaction } from "@/lib/retry-transaction";

import { PFOSEngine } from "@/features/pfos/services/pfos-engine";

import {
  EmploymentType,
  IncomeFrequency,
  FinancialGoal,
  MaritalStatus,
} from "@prisma/client";

interface CreateFinancialProfileInput {
  userId: string;
  fullName: string;
  maritalStatus: MaritalStatus;
  employmentType: EmploymentType;
  monthlyIncome: number;
  additionalIncome?: number;
  incomeFrequency: IncomeFrequency;
  hasDebt: boolean;
  totalDebt?: number;
  repaymentAmount?: number;
  mainFinancialGoal: FinancialGoal;
  emergencySavingsGoal?: number;
  interestedInInvesting: boolean;
  rentHousing?: number;
  food?: number;
  transport?: number;
  utilities?: number;
  schoolFees?: number;
  subscriptions?: number;
  healthCare?: number;
  miscellaneousExpenses?: number;
  dependentsCount?: number;
}

export async function createFinancialProfile(
  input: CreateFinancialProfileInput
) {
  const profile = await db.financialProfile.create({
    data: {
      userId: input.userId,
      fullName: input.fullName,
      maritalStatus: input.maritalStatus,
      employmentType: input.employmentType,
      monthlyIncome: input.monthlyIncome,
      additionalIncome: input.additionalIncome ?? 0,
      incomeFrequency: input.incomeFrequency,
      hasDebt: input.hasDebt,
      totalDebt: input.totalDebt ?? 0,
      repaymentAmount: input.repaymentAmount ?? 0,
      mainFinancialGoal: input.mainFinancialGoal,
      emergencySavingsGoal: input.emergencySavingsGoal ?? 0,
      interestedInInvesting: input.interestedInInvesting,
      dependentsCount: input.dependentsCount ?? 0,
    },
  });

  const blueprint = PFOSEngine.generateBlueprint({
    monthlyIncome: input.monthlyIncome,
    totalDebt: input.totalDebt ?? 0,
    repaymentAmount: input.repaymentAmount ?? 0,
    rentHousing: input.rentHousing ?? 0,
    food: input.food ?? 0,
    transport: input.transport ?? 0,
    utilities: input.utilities ?? 0,
    schoolFees: input.schoolFees ?? 0,
    subscriptions: input.subscriptions ?? 0,
    healthCare: input.healthCare ?? 0,
    miscellaneousExpenses: input.miscellaneousExpenses ?? 0,
    dependentsCount: input.dependentsCount ?? 0,
  });

  await retryTransaction(async (tx) => {
    await tx.householdExpenseProfile.upsert({
      where: { userId: input.userId },
      update: {
        rentHousing: input.rentHousing ?? null,
        food: input.food ?? null,
        transport: input.transport ?? null,
        utilities: input.utilities ?? null,
        schoolFees: input.schoolFees ?? null,
        subscriptions: input.subscriptions ?? null,
        healthCare: input.healthCare ?? null,
        miscellaneousExpenses: input.miscellaneousExpenses ?? null,
      },
      create: {
        userId: input.userId,
        rentHousing: input.rentHousing ?? null,
        food: input.food ?? null,
        transport: input.transport ?? null,
        utilities: input.utilities ?? null,
        schoolFees: input.schoolFees ?? null,
        subscriptions: input.subscriptions ?? null,
        healthCare: input.healthCare ?? null,
        miscellaneousExpenses: input.miscellaneousExpenses ?? null,
      },
    });

    await tx.financialBlueprint.updateMany({
      where: { userId: input.userId, isActive: true },
      data: { isActive: false },
    });

    const latestBlueprint = await tx.financialBlueprint.findFirst({
      where: { userId: input.userId },
      orderBy: { version: "desc" },
    });

    const nextVersion = (latestBlueprint?.version ?? 0) + 1;

    await tx.financialBlueprint.create({
      data: {
        userId: input.userId,
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
        interpretation: `${blueprint.blueprintMode} financial profile`,
      },
    });
  });

  await db.savingsAccount.create({
    data: {
      userId: input.userId,
      emergencyFund: 0,
      treasurySavings: 0,
      goalSavings: 0,
      investmentCash: 0,
    },
  });

    // Build budget allocations from the user's stated monthly expenses
  // scaled proportionally to fit within the PFOS operational budget
  const statedExpenses: { category: string; amount: number }[] = [
    { category: "Housing", amount: input.rentHousing ?? 0 },
    { category: "Food", amount: input.food ?? 0 },
    { category: "Transportation", amount: input.transport ?? 0 },
    { category: "Utilities", amount: input.utilities ?? 0 },
    { category: "Healthcare", amount: input.healthCare ?? 0 },
    { category: "Education", amount: input.schoolFees ?? 0 },
    { category: "Lifestyle", amount: input.subscriptions ?? 0 },
    { category: "Misc", amount: input.miscellaneousExpenses ?? 0 },
  ];

  // Group subscriptions under "Misc" and add Emergency/Family as safety buffers
  // Education and Healthcare have their own categories from onboarding
  const totalStatedExpenses = statedExpenses.reduce((s, e) => s + e.amount, 0);

  let allocationsToCreate: {
    category: string;
    percentage: number;
    recommended: number;
  }[];

    if (totalStatedExpenses > 0) {
    const operationalBudget = Number(blueprint.operationalAllocation);
    const allocatableBudget = operationalBudget * 0.9;

    if (totalStatedExpenses <= allocatableBudget) {
      // User's stated expenses fit within the PFOS budget — use as-is
      allocationsToCreate = statedExpenses.map((exp) => {
        const recommended = exp.amount;
        return {
          category: exp.category,
          percentage: operationalBudget > 0 ? recommended / operationalBudget : 0,
          recommended: Math.round(recommended),
        };
      });
    } else {
      // User's stated expenses exceed the PFOS budget — scale down proportionally
      allocationsToCreate = statedExpenses.map((exp) => {
        const userRatio = exp.amount / totalStatedExpenses;
        const recommended = allocatableBudget * userRatio;
        return {
          category: exp.category,
          percentage: recommended / operationalBudget,
          recommended: Math.round(recommended),
        };
      });
    }

    // Add Emergency and Family from remaining buffer
    const allocatedSum = allocationsToCreate.reduce((s, a) => s + a.recommended, 0);
    const bufferRemaining = operationalBudget > allocatedSum ? operationalBudget - allocatedSum : 0;
    if (bufferRemaining > 0) {
      allocationsToCreate.push({
        category: "Emergency",
        percentage: (bufferRemaining * 0.25) / operationalBudget,
        recommended: Math.round(bufferRemaining * 0.25),
      });
      allocationsToCreate.push({
        category: "Family",
        percentage: (bufferRemaining * 0.75) / operationalBudget,
        recommended: Math.round(bufferRemaining * 0.75),
      });
    }
  } else {
    // Fallback: no stated expenses — use generic PFOS percentages
    allocationsToCreate = [
      { category: "Housing", percentage: 0.3, recommended: blueprint.operationalAllocation * 0.3 },
      { category: "Food", percentage: 0.15, recommended: blueprint.operationalAllocation * 0.15 },
      { category: "Transportation", percentage: 0.1, recommended: blueprint.operationalAllocation * 0.1 },
      { category: "Utilities", percentage: 0.07, recommended: blueprint.operationalAllocation * 0.07 },
      { category: "Healthcare", percentage: 0.05, recommended: blueprint.operationalAllocation * 0.05 },
      { category: "Lifestyle", percentage: 0.05, recommended: blueprint.operationalAllocation * 0.05 },
      { category: "Emergency", percentage: 0.05, recommended: blueprint.operationalAllocation * 0.05 },
      { category: "Education", percentage: 0.08, recommended: blueprint.operationalAllocation * 0.08 },
      { category: "Family", percentage: 0.1, recommended: blueprint.operationalAllocation * 0.1 },
      { category: "Misc", percentage: 0.05, recommended: blueprint.operationalAllocation * 0.05 },
    ];
  }

  await db.budgetAllocation.createMany({
    data: allocationsToCreate.map((item) => ({
      userId: input.userId,
      category: item.category,
      percentage: item.percentage,
      recommended: Math.round(item.recommended),
      actual: 0,
    })),
  });

  return { success: true, profile, blueprint };
}