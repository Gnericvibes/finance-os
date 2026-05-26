"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { ParserEngine } from "@/features/chat/services/parser-engine";

import { BudgetEngine } from "@/features/budgets/services/budget-engine";

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

  if (
    parsed.entries.length > 0
  ) {
    await db.entry.createMany({
      data: parsed.entries.map(
        (entry) => ({
          type: entry.type,

          title: entry.title,

          amount: entry.amount,

          category:
            entry.category,

          userId:
            session.user.id,
        })
      ),
    });
  }

  /*
   -----------------------------------
   PROFILE UPDATES
   -----------------------------------
  */

  if (
    parsed.profileUpdates
  ) {
    await db.profile.update({
      where: {
        userId:
          session.user.id,
      },

      data: {
        ...(parsed
          .profileUpdates
          .dependents !==
        undefined
          ? {
              dependents:
                parsed
                  .profileUpdates
                  .dependents,
            }
          : {}),
      },
    });
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
    await db.profile.findUnique({
      where: {
        userId:
          session.user.id,
      },
    });

  const blueprint =
    await db.pFOSBlueprint.findUnique(
      {
        where: {
          userId:
            session.user.id,
        },
      }
    );

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
        categories: true,
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
        userId:
          session.user.id,
      },
    });

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
      const budgetAnalysis =
        BudgetEngine.analyzeBudget(
          activeBudget.categories,
          allEntries
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
      const totalExpenses =
        allEntries
          .filter(
            (entry) =>
              entry.type ===
              "EXPENSE"
          )
          .reduce(
            (
              acc,
              entry
            ) =>
              acc +
              entry.amount,
            0
          );

      const lifestyleLimit =
        (profile.monthlyIncome *
          blueprint.lifestyleAllocation) /
        100;

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

      const income =
        allEntries
          .filter(
            (entry) =>
              entry.type ===
              "INCOME"
          )
          .reduce(
            (
              acc,
              entry
            ) =>
              acc +
              entry.amount,
            0
          );

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

      if (
        blueprint.savingsRate <
        20
      ) {
        assistantResponse +=
          " Savings rate is below optimal PFOS target. Increase savings allocation gradually.";
      }
    }

    /*
     -----------------------------------
     SHOPPING DETECTION
     -----------------------------------
    */

    const shoppingEntries =
      parsed.entries.filter(
        (entry) =>
          entry.category ===
          "shopping"
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