"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { ParserEngine } from "@/features/chat/services/parser-engine";

import { AIParser } from "@/features/ai/services/ai-parser";

import { AIAdvisor } from "@/features/ai/services/ai-advisor";

import { PFOSEngine } from "@/features/pfos/services/pfos-engine";

import { retryTransaction } from "@/lib/retry-transaction";


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

    /* TODO
   -----------------------------------
   PARSE MESSAGE (AI FIRST, FALLBACK TO REGEX)
   -----------------------------------
  */

  let parsed;

  try {
    const aiResult = await AIParser.parse(
      session.user.id,
      content
    );

    if (aiResult && aiResult.entries.length > 0) {
      parsed = {
        entries: aiResult.entries,
        profileUpdates: aiResult.profileUpdates,
        detectedIntent: "ENTRY" as const,
        aiResponse: "",
      };
    } else {
      throw new Error("AI returned no entries");
    }
  } catch {
    console.log("AI parser unavailable, falling back to regex parser");

    parsed = ParserEngine.parse(content);
  }

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
      isMaritalStatus(parsed.profileUpdates.maritalStatus) ||
      parsed.profileUpdates.totalDebt !== undefined);

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

        ...(parsed.profileUpdates.totalDebt !== undefined
          ? {
              totalDebt: parsed.profileUpdates.totalDebt,
              hasDebt: parsed.profileUpdates.totalDebt > 0,
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

      await retryTransaction(async (tx) => {
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
   GENERATE AI ADVISORY RESPONSE
   -----------------------------------
  */

  let assistantResponse = await AIAdvisor.generateAdvice(
    session.user.id,
    content,
    parsed.entries
  );

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
    response: assistantResponse,
  };
}