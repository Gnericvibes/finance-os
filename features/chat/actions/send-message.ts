"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { ParserEngine } from "@/features/chat/services/parser-engine";

import { BudgetEngine } from "@/features/budgets/services/budget-engine";

import { PFOSEngine } from "@/features/pfos/services/pfos-engine";


/*
 -----------------------------------
 SEND MESSAGE
 -----------------------------------
*/

export async function sendMessage(
  conversationId: string,
  content: string
) {
  /*
   -----------------------------------
   SESSION
   -----------------------------------
  */

  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user) {
    throw new Error(
      "Unauthorized"
    );
  }

  /*
   -----------------------------------
   VERIFY CONVERSATION
   -----------------------------------
  */

  const conversation =
    await db.conversation.findFirst({
      where: {
        id: conversationId,

        userId: session.user.id,
      },
    });

  if (!conversation) {
    throw new Error(
      "Conversation not found"
    );
  }

  /*
   -----------------------------------
   SAVE USER MESSAGE
   -----------------------------------
  */

  await db.chatMessage.create({
    data: {
      role: "user",

      content,

      conversationId,
    },
  });

  /*
   -----------------------------------
   PARSE MESSAGE
   -----------------------------------
  */

  const parsed =
    ParserEngine.parse(content);

  /*
   -----------------------------------
   SAVE ENTRIES
   -----------------------------------
  */

    if (parsed.entries.length > 0) {
    await Promise.all(
      parsed.entries.map((entry) =>
        PFOSEngine.createEntry({
          ...entry,
          userId: session.user.id,
        })
      )
    );
  }


  /*
   -----------------------------------
   PROFILE UPDATES
   -----------------------------------
  */

    const isMaritalStatus = (
    value: unknown
  ): value is "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" => {
    return (
      value === "SINGLE" ||
      value === "MARRIED" ||
      value === "DIVORCED" ||
      value === "WIDOWED"
    );
  };

    const shouldRecomputeBlueprint =
    parsed.profileUpdates !== null &&
    (parsed.profileUpdates.dependents !== undefined ||
      isMaritalStatus(parsed.profileUpdates.maritalStatus));

  if (parsed.profileUpdates) {
    await db.financialProfile.updateMany({
      where: {
        userId: session.user.id,
      },

      data: {
        ...(parsed.profileUpdates.dependents !== undefined
          ? {
              hasDependents: parsed.profileUpdates.dependents > 0,
              dependentsCount: parsed.profileUpdates.dependents,
            }
          : {}),

        ...(isMaritalStatus(parsed.profileUpdates.maritalStatus)
          ? {
              maritalStatus: parsed.profileUpdates.maritalStatus,
            }
          : {}),
      },
    });
  }

  // Profile changes affect PFOS allocations: generate a new versioned blueprint.
  if (shouldRecomputeBlueprint) {
    const latestProfile = await db.financialProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (latestProfile) {
      const expenseProfile = await db.householdExpenseProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

      const generated = PFOSEngine.generateBlueprint({
        monthlyIncome: Number(latestProfile.monthlyIncome),

        totalDebt: Number(latestProfile.totalDebt ?? 0),
        repaymentAmount: Number(latestProfile.repaymentAmount ?? 0),

        rentHousing: Number(expenseProfile?.rentHousing ?? 0),
        food: Number(expenseProfile?.food ?? 0),
        transport: Number(expenseProfile?.transport ?? 0),
        utilities: Number(expenseProfile?.utilities ?? 0),
        schoolFees: Number(expenseProfile?.schoolFees ?? 0),
        subscriptions: Number(expenseProfile?.subscriptions ?? 0),
        healthCare: Number(expenseProfile?.healthCare ?? 0),
        miscellaneousExpenses: Number(expenseProfile?.miscellaneousExpenses ?? 0),

        dependentsCount: latestProfile.dependentsCount,
      });

      await db.$transaction(async (tx) => {
        await tx.financialBlueprint.updateMany({
          where: {
            userId: session.user.id,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });

        const latestBlueprint = await tx.financialBlueprint.findFirst({
          where: {
            userId: session.user.id,
          },
          orderBy: {
            version: "desc",
          },
        });

        const nextVersion = (latestBlueprint?.version ?? 0) + 1;

        await tx.financialBlueprint.create({
          data: {
            userId: session.user.id,
            version: nextVersion,
            isActive: true,

            operationalAllocation: generated.operationalAllocation,
            debtAllocation: generated.debtAllocation,
            investmentAllocation: generated.investmentAllocation,
            emergencyAllocation: generated.emergencyAllocation,

            operationalPercentage: generated.operationalPercentage,
            debtPercentage: generated.debtPercentage,
            investmentPercentage: generated.investmentPercentage,
            emergencyPercentage: generated.emergencyPercentage,

            financialHealthScore: generated.financialHealthScore,
            blueprintMode: generated.blueprintMode,
            isDebtFree: generated.isDebtFree,

            interpretation: `Recomputed after profile update (${generated.blueprintMode})`,
          },
        });
      });
    }
  }



  /*
   -----------------------------------
   BASE RESPONSE
   -----------------------------------
  */

  let assistantResponse =
    parsed.aiResponse;

  /*
   -----------------------------------
   FETCH USER DATA
   -----------------------------------
  */

    const profile =
    await db.financialProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    const blueprint = await db.financialBlueprint.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    orderBy: {
      version: "desc",
    },
  });


  const blueprintData = blueprint
    ? {
        operationalPercentage: blueprint.operationalPercentage,
        debtPercentage: blueprint.debtPercentage,
        emergencyPercentage: blueprint.emergencyPercentage,
        investmentPercentage: blueprint.investmentPercentage,
      }
    : undefined;


  /*
   -----------------------------------
   FETCH ACTIVE BUDGET
   -----------------------------------
  */

  const now = new Date();

  const activeBudget =
    await db.budget.findFirst({
      where: {
        userId:
          session.user.id,

        month:
          now.getMonth() + 1,

        year:
          now.getFullYear(),
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
   FETCH USER ENTRIES
   -----------------------------------
  */

    const allEntries =
    await db.entry.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

  const allEntryData = allEntries.map((entry) => ({
    type: entry.type,
    amount: Number(entry.amount),
    category: entry.category?.name ?? "Uncategorized",
  }));


  /*
   -----------------------------------
   TRANSACTION INSIGHTS
   -----------------------------------
  */

  if (
    parsed.entries.length > 0
  ) {
    const total =
      parsed.entries.reduce(
        (
          acc,
          entry
        ) =>
          acc +
          entry.amount,
        0
      );

    assistantResponse += ` Total processed amount: ₦${total.toLocaleString()}.`;

    /*
     -----------------------------------
     LARGE SPENDING ALERT
     -----------------------------------
    */

    if (
      total > 100000
    ) {
      assistantResponse +=
        " Large transaction volume detected. Monitor cashflow carefully.";
    }

    /*
     -----------------------------------
     BUDGET ANALYSIS
     -----------------------------------
    */

    if (
      activeBudget
    ) {
            const budgetAnalysis = BudgetEngine.analyzeBudget(
        activeBudget.categories.map((category) => ({
          category: category.category.name,
          limitAmount: Number(category.limitAmount),
        })),
        allEntryData,
        blueprintData
      );


      const warnings =
        budgetAnalysis.filter(
          (item) =>
            item.status ===
              "OVER_BUDGET" ||
            item.status ===
              "WARNING"
        );

      if (
        warnings.length > 0
      ) {
        assistantResponse +=
          " Budget alerts detected.";

        warnings.forEach(
          (warning) => {
            if (
              warning.status ===
              "OVER_BUDGET"
            ) {
              assistantResponse += ` ${warning.category} budget exceeded by ${warning.percentage - 100}%.`;
            }

            if (
              warning.status ===
              "WARNING"
            ) {
              assistantResponse += ` ${warning.category} spending is at ${warning.percentage}% of budget.`;
            }
          }
        );
      }
    }

    /*
     -----------------------------------
     PFOS LIFESTYLE CHECK
     -----------------------------------
    */

    if (
      blueprint &&
      profile
    ) {
            const totalExpenses = allEntryData
        .filter((entry) => entry.type === "EXPENSE")
        .reduce((acc, entry) => acc + entry.amount, 0);

      const monthlyIncome = Number(profile.monthlyIncome);

      const lifestyleLimit =
        (monthlyIncome * blueprint.operationalPercentage) / 100;


      if (
        totalExpenses >
        lifestyleLimit
      ) {
        assistantResponse +=
          " PFOS warning: lifestyle spending is exceeding your recommended allocation.";
      }

      /*
       -----------------------------------
       LOW CASHFLOW ALERT
       -----------------------------------
      */

            const income = allEntryData
        .filter((entry) => entry.type === "INCOME")
        .reduce((acc, entry) => acc + entry.amount, 0);


      const cashflow =
        income -
        totalExpenses;

      if (
        cashflow < 0
      ) {
        assistantResponse +=
          " Negative cashflow detected. Expense reduction is recommended immediately.";
      }

      /*
       -----------------------------------
       SAVINGS COACHING
       -----------------------------------
      */

            const savingsRate =
        income === 0
          ? 0
          : Math.round(((income - totalExpenses) / income) * 100);

      if (savingsRate < 20) {
        assistantResponse +=
          " Savings rate is below optimal PFOS target. Increase savings allocation gradually.";
      }

    }

    /*
     -----------------------------------
     SHOPPING DETECTION
     -----------------------------------
    */

        const shoppingEntries = parsed.entries.filter(
      (entry) => entry.category.toLowerCase() === "shopping"
    );


    if (
      shoppingEntries.length >
      0
    ) {
      assistantResponse +=
        " Lifestyle spending detected. Ensure discretionary purchases align with long-term financial stability.";
    }
  }

  /*
   -----------------------------------
   SAVE AI MESSAGE
   -----------------------------------
  */

  await db.chatMessage.create({
    data: {
      role: "assistant",

      content:
        assistantResponse,

      conversationId,
    },
  });

  /*
   -----------------------------------
   RETURN
   -----------------------------------
  */

  return {
    success: true,
  };
}