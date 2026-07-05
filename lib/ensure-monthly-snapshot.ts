import { db } from "@/lib/db";

function formatYearMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function ensureMonthlySnapshot(userId: string) {
  const [blueprint, profile] = await Promise.all([
    db.financialBlueprint.findFirst({
      where: { userId, isActive: true },
      orderBy: { version: "desc" },
      select: { id: true, financialHealthScore: true },
    }),
    db.financialProfile.findUnique({
      where: { userId },
      select: { totalDebt: true },
    }),
  ]);

  if (!blueprint) return;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const existing = await db.snapshot.findFirst({
    where: {
      userId,
      createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      title: { startsWith: "Monthly Snapshot" },
    },
    select: { id: true },
  });

  if (existing) return;

  /*
   -----------------------------------
   COMPUTE FINANCIAL POSITIONS
   -----------------------------------
  */

  const allEntries = await db.entry.findMany({
    where: { userId, isDeleted: false },
    select: { type: true, amount: true },
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalInvestments = 0;
  let totalDebtPayments = 0;

  for (const entry of allEntries) {
    const amount = Number(entry.amount);
    switch (entry.type) {
      case "INCOME": totalIncome += amount; break;
      case "EXPENSE": totalExpenses += amount; break;
      case "INVESTMENT": totalInvestments += amount; break;
      case "DEBT_PAYMENT": totalDebtPayments += amount; break;
    }
  }

  const netWorth = totalIncome - totalExpenses - totalDebtPayments - totalInvestments;
  const cashPosition = totalIncome - totalExpenses;
  const totalDebt = profile?.totalDebt ? Number(profile.totalDebt) : 0;
  const debtPosition = Math.max(0, totalDebt - totalDebtPayments);
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
