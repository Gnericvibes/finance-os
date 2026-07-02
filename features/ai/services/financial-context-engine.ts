import { db } from "@/lib/db";

export class FinancialContextEngine {
  static async build(userId: string) {
    /*
     -----------------------------------
     PROFILE
     -----------------------------------
    */

    const profile = await db.financialProfile.findUnique({
      where: {
        userId,
      },
    });

    /*
     -----------------------------------
     BLUEPRINT
     -----------------------------------
    */

        const blueprint = await db.financialBlueprint.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        version: "desc",
      },
    });


    /*
     -----------------------------------
     RECENT ENTRIES
     -----------------------------------
    */

    const entries = await db.entry.findMany({
      where: {
        userId,
      },

      include: {
        category: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 100,
    });

    const normalizedEntries = entries.map((entry) => ({
      type: entry.type,
      amount: Number(entry.amount),
      category: entry.category?.name ?? "Uncategorized",
    }));

    /*
     -----------------------------------
     BUDGETS
     -----------------------------------
    */

    const budgets = await db.budget.findMany({
      where: {
        userId,
      },

      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    /*
     -----------------------------------
     CALCULATIONS
     -----------------------------------
    */

    const income = normalizedEntries
      .filter((e) => e.type === "INCOME")
      .reduce((acc, e) => acc + e.amount, 0);

    const expenses = normalizedEntries
      .filter((e) => e.type === "EXPENSE" || e.type === "DEBT_PAYMENT")
      .reduce((acc, e) => acc + e.amount, 0);

    const savingsRate =
      income === 0 ? 0 : Math.round(((income - expenses) / income) * 100);

    /*
     -----------------------------------
     BUDGET WARNINGS
     -----------------------------------
    */

    const budgetWarnings: string[] = [];

    for (const budget of budgets) {
      for (const category of budget.categories) {
        const spent = normalizedEntries
          .filter(
            (entry) =>
              entry.type === "EXPENSE" &&
              entry.category.toLowerCase() ===
                category.category.name.toLowerCase()
          )
          .reduce((acc, entry) => acc + entry.amount, 0);

        if (spent > Number(category.limitAmount)) {
          budgetWarnings.push(
            `${category.category.name} exceeded budget`
          );
        }
      }
    }

    /*
     -----------------------------------
     TOP CATEGORIES
     -----------------------------------
    */

    const categoryMap = new Map<string, number>();

    normalizedEntries
      .filter((e) => e.type === "EXPENSE")
      .forEach((e) => {
        categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
      });

    const topSpendingCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    return {
      profile,
      blueprint,
      income,
      expenses,
      savingsRate,
      budgetWarnings,
      topSpendingCategories,
    };
  }
}