import { db } from "@/lib/db";
import type { DashboardEntry } from "@/features/dashboard/services/dashboard-engine";

/**
 * Batch loads all commonly-needed user data in the fewest queries possible.
 * This replaces the pattern of 4-6 independent await queries spread across pages.
 */

export type UserFinancialData = {
  profile: NonNullable<Awaited<ReturnType<typeof db.financialProfile.findUnique>>> | null;
  blueprint: Awaited<ReturnType<typeof db.financialBlueprint.findFirst>> | null;
  expenseProfile: Awaited<ReturnType<typeof db.householdExpenseProfile.findUnique>> | null;
  entries: Awaited<ReturnType<typeof db.entry.findMany>>;
  entryData: DashboardEntry[];
  budgetAllocations: Awaited<ReturnType<typeof db.budgetAllocation.findMany>>;
};

export async function loadUserFinancialData(userId: string): Promise<UserFinancialData> {
  const [profile, blueprint, expenseProfile, entries, budgetAllocations] = await Promise.all([
    db.financialProfile.findUnique({ where: { userId } }),
    db.financialBlueprint.findFirst({
      where: { userId, isActive: true },
      orderBy: { version: "desc" },
    }),
    db.householdExpenseProfile.findUnique({ where: { userId } }),
    db.entry.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.budgetAllocation.findMany({ where: { userId } }),
  ]);

  const entryData: DashboardEntry[] = entries.map((entry) => ({
    type: entry.type,
    amount: Number(entry.amount),
    category: entry.category?.name ?? "Uncategorized",
  }));

  return { profile, blueprint, expenseProfile, entries, entryData, budgetAllocations };
}

/**
 * Computes scaled budget allocation recommendations from the user's stated expenses
 * and PFOS operational budget. This logic was duplicated across 3+ files.
 */
export function computeAllocationData(
  expenseProfile: { rentHousing?: any; food?: any; transport?: any; utilities?: any; schoolFees?: any; subscriptions?: any; healthCare?: any; miscellaneousExpenses?: any } | null,
  totalOperationalBudget: number
): { category: string; recommended: number; percentage: number }[] {
  if (!expenseProfile || totalOperationalBudget <= 0) return [];

  const statedExpenses: { category: string; amount: number }[] = [
    { category: "Housing", amount: Number(expenseProfile.rentHousing ?? 0) },
    { category: "Food", amount: Number(expenseProfile.food ?? 0) },
    { category: "Transportation", amount: Number(expenseProfile.transport ?? 0) },
    { category: "Utilities", amount: Number(expenseProfile.utilities ?? 0) },
    { category: "Healthcare", amount: Number(expenseProfile.healthCare ?? 0) },
    { category: "Education", amount: Number(expenseProfile.schoolFees ?? 0) },
    { category: "Lifestyle", amount: Number(expenseProfile.subscriptions ?? 0) },
    { category: "Misc", amount: Number(expenseProfile.miscellaneousExpenses ?? 0) },
  ];

  const totalStated = statedExpenses.reduce((s, e) => s + e.amount, 0);
  if (totalStated <= 0) return [];

  const allocatableBudget = totalOperationalBudget * 0.9;
  let allocationData: { category: string; recommended: number; percentage: number }[];

  if (totalStated <= allocatableBudget) {
    allocationData = statedExpenses.map((exp) => ({
      category: exp.category,
      recommended: Math.round(exp.amount),
      percentage: Math.round(exp.amount) / totalOperationalBudget,
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
  const bufferRemaining = totalOperationalBudget - allocatedSum;

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

  return allocationData;
}
