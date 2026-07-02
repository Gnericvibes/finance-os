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

  const yearMonth = formatYearMonth(now);

  await db.snapshot.create({
    data: {
      userId,
      blueprintId: blueprint.id,
      title: `Monthly Snapshot ${yearMonth}`,
      description: `System-generated monthly snapshot for ${yearMonth}.`,
      netWorth: 0,
      cashPosition: 0,
      debtPosition: 0,
      investmentPosition: 0,
      healthScore: blueprint.financialHealthScore,
    },
  });
}
