import { db } from "@/lib/db";

function formatYearMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function ensureMonthlySnapshot(userId: string) {
  const blueprint = await db.financialBlueprint.findFirst({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      version: "desc",
    },
  });

  // No blueprint => no snapshot (user likely hasn't onboarded yet)
  if (!blueprint) return;

  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const existing = await db.snapshot.findFirst({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
      title: {
        startsWith: "Monthly Snapshot",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existing) return;

  /*
   -----------------------------------
   COMPUTE FINANCIAL POSITIONS
   -----------------------------------
   Computes real values from the user's entries and accounts at snapshot time.
  */

  const allEntries = await db.entry.findMany({
    where: { userId, isDeleted: false },
    select: { type: true, amount: true },
  });

  // Net worth: income minus expenses, debt repayments, and investments
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalInvestments = 0;
  let totalDebtPayments = 0;

  for (const entry of allEntries) {
    const amount = Number(entry.amount);

    switch (entry.type) {
      case "INCOME":
        totalIncome += amount;
        break;
      case "EXPENSE":
        totalExpenses += amount;
        break;
      case "INVESTMENT":
        totalInvestments += amount;
        break;
      case "DEBT_PAYMENT":
        totalDebtPayments += amount;
        break;
      // TRANSFER entries are neutral — ignored for net worth
    }
  }

  const netWorth = totalIncome - totalExpenses - totalDebtPayments - totalInvestments;

  // Cash position: total income minus total expenses (liquid cash available)
  const cashPosition = totalIncome - totalExpenses;

  // Debt position: totalDebt (what was borrowed) minus total repaid (DEBT_PAYMENT entries)
  const profile = await db.financialProfile.findUnique({
    where: { userId },
    select: { totalDebt: true },
  });
  const totalDebt = profile?.totalDebt ? Number(profile.totalDebt) : 0;
  const debtPosition = Math.max(0, totalDebt - totalDebtPayments);

  // Investment position: total investments recorded
  const investmentPosition = totalInvestments;

  const yearMonth = formatYearMonth(now);

  await db.snapshot.create({
    data: {
      userId,
      blueprintId: blueprint.id,
      title: `Monthly Snapshot ${yearMonth}`,
      description: `System-generated monthly snapshot for ${yearMonth}.`,
      netWorth,
      cashPosition,
      debtPosition,
      investmentPosition,
      healthScore: blueprint.financialHealthScore,
    },
  });
}
