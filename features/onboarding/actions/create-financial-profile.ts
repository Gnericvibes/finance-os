"use server";

import { db } from "@/lib/db";

import { PFOSBlueprintEngine } from "@/features/pfos/services/pfos-blueprint-engine";

interface CreateFinancialProfileInput {
  userId: string;

  employmentType: string;

  monthlyIncome: number;

  additionalIncome?: number;

  incomeFrequency: string;

  hasDebt: boolean;

  totalDebt?: number;

  monthlyDebtPayments?: number;

  debtInterestRate?: number;

  missedPayments?: boolean;

  mainFinancialGoal: string;

  emergencySavingsGoal?: number;

  interestedInInvesting: boolean;
}

export async function createFinancialProfile(
  input: CreateFinancialProfileInput
) {
  /*
   -----------------------------------
   CREATE FINANCIAL PROFILE
   -----------------------------------
  */

  const profile =
    await db.financialProfile.create({
      data: {
        userId: input.userId,

        employmentType:
          input.employmentType,

        monthlyIncome:
          input.monthlyIncome,

        additionalIncome:
          input.additionalIncome,

        incomeFrequency:
          input.incomeFrequency,

        hasDebt:
          input.hasDebt,

        totalDebt:
          input.totalDebt,

        monthlyDebtPayments:
          input.monthlyDebtPayments,

        debtInterestRate:
          input.debtInterestRate,

        missedPayments:
          input.missedPayments,

        mainFinancialGoal:
          input.mainFinancialGoal,

        emergencySavingsGoal:
          input.emergencySavingsGoal,

        interestedInInvesting:
          input.interestedInInvesting,
      },
    });

  /*
   -----------------------------------
   GENERATE PFOS BLUEPRINT
   -----------------------------------
  */

  const blueprint =
    PFOSBlueprintEngine.generate({
      monthlyIncome:
        input.monthlyIncome,

      hasDebt:
        input.hasDebt,
    });

  /*
   -----------------------------------
   CREATE BLUEPRINT
   -----------------------------------
  */

  await db.financialBlueprint.create({
    data: {
      userId: input.userId,

      investmentAllocation:
        blueprint.investmentAllocation,

      debtAllocation:
        blueprint.debtAllocation,

      treasuryAllocation:
        blueprint.treasuryAllocation,

      operationalAllocation:
        blueprint.operationalAllocation,

      emergencyAllocation:
        blueprint.emergencyAllocation,

      isDebtFree:
        blueprint.isDebtFree,
    },
  });

  /*
   -----------------------------------
   CREATE SAVINGS ACCOUNT
   -----------------------------------
  */

  await db.savingsAccount.create({
    data: {
      userId: input.userId,

      emergencyFund: 0,

      treasurySavings: 0,

      goalSavings: 0,

      investmentCash: 0,
    },
  });

  /*
   -----------------------------------
   INITIALIZE BUDGET ALLOCATIONS
   -----------------------------------
  */

  const operationalBudget =
    blueprint.operationalAllocation;

  const categories = [
    {
      category: "Housing",
      percentage: 0.3,
    },

    {
      category: "Food",
      percentage: 0.15,
    },

    {
      category:
        "Transportation",

      percentage: 0.1,
    },

    {
      category: "Utilities",

      percentage: 0.07,
    },

    {
      category: "Healthcare",

      percentage: 0.05,
    },

    {
      category: "Lifestyle",

      percentage: 0.05,
    },

    {
      category: "Emergency",

      percentage: 0.05,
    },

    {
      category: "Education",

      percentage: 0.08,
    },

    {
      category: "Family",

      percentage: 0.1,
    },

    {
      category: "Misc",

      percentage: 0.05,
    },
  ];

  await db.budgetAllocation.createMany({
    data: categories.map(
      (item) => ({
        userId: input.userId,

        category:
          item.category,

        percentage:
          item.percentage,

        recommended:
          operationalBudget *
          item.percentage,
      })
    ),
  });

  return {
    success: true,

    profile,
  };
}