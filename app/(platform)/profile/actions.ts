"use server";

import { db } from "@/lib/db";
import { retryTransaction } from "@/lib/retry-transaction";
import { getCurrentUser } from "@/lib/current-user";
import { PFOSEngine } from "@/features/pfos/services/pfos-engine";

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

  return { success: true };
}
