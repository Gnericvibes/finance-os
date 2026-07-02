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

  await db.budgetAllocation.createMany({
    data: [
      { category: "Housing", percentage: 0.3 },
      { category: "Food", percentage: 0.15 },
      { category: "Transportation", percentage: 0.1 },
      { category: "Utilities", percentage: 0.07 },
      { category: "Healthcare", percentage: 0.05 },
      { category: "Lifestyle", percentage: 0.05 },
      { category: "Emergency", percentage: 0.05 },
      { category: "Education", percentage: 0.08 },
      { category: "Family", percentage: 0.1 },
      { category: "Misc", percentage: 0.05 },
    ].map((item) => ({
      userId: input.userId,
      category: item.category,
      percentage: item.percentage,
      recommended: blueprint.operationalAllocation * item.percentage,
      actual: 0,
    })),
  });

  return { success: true, profile, blueprint };
}