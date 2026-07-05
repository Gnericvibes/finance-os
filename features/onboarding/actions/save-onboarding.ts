"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

import { PFOSEngine } from "@/features/pfos/services/pfos-engine";

import { retryTransaction } from "@/lib/retry-transaction";

import {
  onboardingSchema,
  type OnboardingFormValues,
} from "../schemas/onboarding-schema";

export async function saveOnboarding(data: OnboardingFormValues) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const values = onboardingSchema.parse(data);

  /*
   -----------------------------------
   GENERATE BLUEPRINT
   -----------------------------------
  */

  const blueprint = PFOSEngine.generateBlueprint({
    monthlyIncome: Number(values.mainMonthlyIncome),

    totalDebt: Number(values.totalDebt || 0),
    repaymentAmount: Number(values.repaymentAmount || 0),

    rentHousing: Number(values.rentHousing || 0),
    food: Number(values.food || 0),
    transport: Number(values.transport || 0),
    utilities: Number(values.utilities || 0),
    schoolFees: Number(values.schoolFees || 0),
    subscriptions: Number(values.subscriptions || 0),
    healthCare: Number(values.healthCare || 0),
    miscellaneousExpenses: Number(values.miscellaneousExpenses || 0),

    dependentsCount: Number(values.dependentsCount || 0),
  });

        const { financialProfile, createdBlueprint } = await retryTransaction(
    async (tx) => {
      /*
       -----------------------------------
       CREATE / UPDATE FINANCIAL PROFILE
       -----------------------------------
      */

      const financialProfile = await tx.financialProfile.upsert({
        where: {
          userId: user.id,
        },

        update: {
          fullName: values.fullName,
          employmentType: values.employmentType,
          maritalStatus: values.maritalStatus,

          hasDependents: values.hasDependents === "true",
          dependentsCount: Number(values.dependentsCount || 0),

          currency: values.currency,
          monthlyIncome: Number(values.mainMonthlyIncome),
          additionalIncome: values.additionalIncome
            ? Number(values.additionalIncome)
            : null,
          incomeFrequency: values.incomeFrequency,

          hasDebt: values.hasDebt === "true",
          totalDebt: values.totalDebt ? Number(values.totalDebt) : null,
          repaymentAmount: values.repaymentAmount
            ? Number(values.repaymentAmount)
            : null,

          mainFinancialGoal: values.financialGoal,
          emergencySavingsGoal: values.emergencySavingsGoal
            ? Number(values.emergencySavingsGoal)
            : null,

          interestedInInvesting: values.interestedInInvesting === "true",
        },

        create: {
          userId: user.id,

          fullName: values.fullName,
          employmentType: values.employmentType,
          maritalStatus: values.maritalStatus,

          hasDependents: values.hasDependents === "true",
          dependentsCount: Number(values.dependentsCount || 0),

          currency: values.currency,
          monthlyIncome: Number(values.mainMonthlyIncome),
          additionalIncome: values.additionalIncome
            ? Number(values.additionalIncome)
            : null,
          incomeFrequency: values.incomeFrequency,

          hasDebt: values.hasDebt === "true",
          totalDebt: values.totalDebt ? Number(values.totalDebt) : null,
          repaymentAmount: values.repaymentAmount
            ? Number(values.repaymentAmount)
            : null,

          mainFinancialGoal: values.financialGoal,
          emergencySavingsGoal: values.emergencySavingsGoal
            ? Number(values.emergencySavingsGoal)
            : null,

          interestedInInvesting: values.interestedInInvesting === "true",
        },
      });

            /*
       -----------------------------------
       UPSERT HOUSEHOLD EXPENSE PROFILE
       -----------------------------------
      */

      await tx.householdExpenseProfile.upsert({
        where: {
          userId: user.id,
        },

        update: {
          rentHousing: values.rentHousing ? Number(values.rentHousing) : null,
          food: values.food ? Number(values.food) : null,
          transport: values.transport ? Number(values.transport) : null,
          utilities: values.utilities ? Number(values.utilities) : null,
          schoolFees: values.schoolFees ? Number(values.schoolFees) : null,
          subscriptions: values.subscriptions ? Number(values.subscriptions) : null,
          healthCare: values.healthCare ? Number(values.healthCare) : null,
          miscellaneousExpenses: values.miscellaneousExpenses
            ? Number(values.miscellaneousExpenses)
            : null,
        },

        create: {
          userId: user.id,
          rentHousing: values.rentHousing ? Number(values.rentHousing) : null,
          food: values.food ? Number(values.food) : null,
          transport: values.transport ? Number(values.transport) : null,
          utilities: values.utilities ? Number(values.utilities) : null,
          schoolFees: values.schoolFees ? Number(values.schoolFees) : null,
          subscriptions: values.subscriptions ? Number(values.subscriptions) : null,
          healthCare: values.healthCare ? Number(values.healthCare) : null,
          miscellaneousExpenses: values.miscellaneousExpenses
            ? Number(values.miscellaneousExpenses)
            : null,
        },
      });

      /*
       -----------------------------------
       STORE FINANCIAL BLUEPRINT (VERSIONED)
       -----------------------------------
      */

      await tx.financialBlueprint.updateMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });


      const latestBlueprint = await tx.financialBlueprint.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          version: "desc",
        },
      });

      const nextVersion = (latestBlueprint?.version ?? 0) + 1;

      const createdBlueprint = await tx.financialBlueprint.create({
        data: {
          userId: user.id,
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

      /*
       -----------------------------------
       CREATE INITIAL SNAPSHOT (LINKED)
       -----------------------------------
      */

      await tx.snapshot.create({
        data: {
          userId: user.id,
          blueprintId: createdBlueprint.id,

          title: "Initial PFOS Blueprint",

          description: `
Income: ${values.mainMonthlyIncome}
Health Score: ${blueprint.financialHealthScore}
Goal: ${values.financialGoal}
`,

          netWorth: 0,
          cashPosition: 0,
          debtPosition: Number(values.totalDebt || 0),
          investmentPosition: 0,
          healthScore: blueprint.financialHealthScore,
        },
      });

      return {
        financialProfile,
        createdBlueprint,
      };
    }
  );


    /*
   -----------------------------------
   SEED BUDGET ALLOCATIONS
   -----------------------------------
  */

  const existingAllocations = await db.budgetAllocation.count({
    where: { userId: user.id },
  });

    if (existingAllocations === 0) {
      const statedExpenses: { category: string; amount: number }[] = [
        { category: "Housing", amount: Number(values.rentHousing || 0) },
        { category: "Food", amount: Number(values.food || 0) },
        { category: "Transportation", amount: Number(values.transport || 0) },
        { category: "Utilities", amount: Number(values.utilities || 0) },
        { category: "Healthcare", amount: Number(values.healthCare || 0) },
        { category: "Education", amount: Number(values.schoolFees || 0) },
        { category: "Lifestyle", amount: Number(values.subscriptions || 0) },
        { category: "Misc", amount: Number(values.miscellaneousExpenses || 0) },
      ];

      const totalStatedExpenses = statedExpenses.reduce((s, e) => s + e.amount, 0);
      const operationalBudget = Number(blueprint.operationalAllocation);

      let allocationsToCreate: {
        category: string;
        percentage: number;
        recommended: number;
      }[];

      if (totalStatedExpenses > 0) {
        const allocatableBudget = operationalBudget * 0.9;

        if (totalStatedExpenses <= allocatableBudget) {
          // User's stated expenses fit within PFOS budget — use as-is
          allocationsToCreate = statedExpenses.map((exp) => {
            const recommended = exp.amount;
            return {
              category: exp.category,
              percentage: operationalBudget > 0 ? recommended / operationalBudget : 0,
              recommended: Math.round(recommended),
            };
          });
        } else {
          // User's stated expenses exceed PFOS budget — scale down proportionally
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
        // Fallback: generic PFOS percentages
        allocationsToCreate = [
          { category: "Housing", percentage: 0.3, recommended: Math.round(operationalBudget * 0.3) },
          { category: "Food", percentage: 0.15, recommended: Math.round(operationalBudget * 0.15) },
          { category: "Transportation", percentage: 0.1, recommended: Math.round(operationalBudget * 0.1) },
          { category: "Utilities", percentage: 0.07, recommended: Math.round(operationalBudget * 0.07) },
          { category: "Healthcare", percentage: 0.05, recommended: Math.round(operationalBudget * 0.05) },
          { category: "Lifestyle", percentage: 0.05, recommended: Math.round(operationalBudget * 0.05) },
          { category: "Emergency", percentage: 0.05, recommended: Math.round(operationalBudget * 0.05) },
          { category: "Education", percentage: 0.08, recommended: Math.round(operationalBudget * 0.08) },
          { category: "Family", percentage: 0.1, recommended: Math.round(operationalBudget * 0.1) },
          { category: "Misc", percentage: 0.05, recommended: Math.round(operationalBudget * 0.05) },
        ];
      }

      await db.budgetAllocation.createMany({
        data: allocationsToCreate.map((item) => ({
          userId: user.id,
          category: item.category,
          percentage: item.percentage,
          recommended: item.recommended,
          actual: 0,
        })),
      });
    }

  return {
    success: true,
    financialProfileId: financialProfile.id,
    financialBlueprintId: createdBlueprint.id,

  };
}