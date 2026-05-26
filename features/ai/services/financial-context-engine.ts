import { db } from "@/lib/db";

export class FinancialContextEngine {
  static async build(
    userId: string
  ) {
    /*
     -----------------------------------
     PROFILE
     -----------------------------------
    */

    const profile =
      await db.profile.findUnique({
        where: {
          userId,
        },
      });

    /*
     -----------------------------------
     BLUEPRINT
     -----------------------------------
    */

    const blueprint =
      await db.pFOSBlueprint.findUnique(
        {
          where: {
            userId,
          },
        }
      );

    /*
     -----------------------------------
     RECENT ENTRIES
     -----------------------------------
    */

    const entries =
      await db.entry.findMany({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 100,
      });

    /*
     -----------------------------------
     BUDGETS
     -----------------------------------
    */

    const budgets =
      await db.budget.findMany({
        where: {
          userId,
        },

        include: {
          categories: true,
        },
      });

    /*
     -----------------------------------
     CALCULATIONS
     -----------------------------------
    */

    const income = entries
      .filter(
        (e) => e.type === "INCOME"
      )
      .reduce(
        (acc, e) =>
          acc + e.amount,
        0
      );

    const expenses = entries
      .filter(
        (e) => e.type === "EXPENSE"
      )
      .reduce(
        (acc, e) =>
          acc + e.amount,
        0
      );

    const savingsRate =
      income === 0
        ? 0
        : Math.round(
            ((income -
              expenses) /
              income) *
              100
          );

    /*
     -----------------------------------
     BUDGET WARNINGS
     -----------------------------------
    */

    const budgetWarnings: string[] =
      [];

    for (const budget of budgets) {
      for (const category of budget.categories) {
        const spent = entries
          .filter(
            (entry) =>
              entry.type ===
                "EXPENSE" &&
              entry.category ===
                category.category
          )
          .reduce(
            (acc, entry) =>
              acc +
              entry.amount,
            0
          );

        if (
          spent >
          category.limitAmount
        ) {
          budgetWarnings.push(
            `${category.category} exceeded budget`
          );
        }
      }
    }

    /*
     -----------------------------------
     TOP CATEGORIES
     -----------------------------------
    */

    const categoryMap =
      new Map<
        string,
        number
      >();

    entries
      .filter(
        (e) =>
          e.type ===
          "EXPENSE"
      )
      .forEach((e) => {
        categoryMap.set(
          e.category,
          (categoryMap.get(
            e.category
          ) || 0) +
            e.amount
        );
      });

    const topSpendingCategories =
      Array.from(
        categoryMap.entries()
      )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
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