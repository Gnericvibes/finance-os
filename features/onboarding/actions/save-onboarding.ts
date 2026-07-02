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

          interestedInInvesting: Boolean(values.interestedInInvesting),
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

          interestedInInvesting: Boolean(values.interestedInInvesting),
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


  return {
    success: true,
    financialProfileId: financialProfile.id,
    financialBlueprintId: createdBlueprint.id,

  };
}