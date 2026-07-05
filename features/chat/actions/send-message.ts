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

  /*
   -----------------------------------
   AUTO-TITLE CONVERSATION
   Sets a title from the first user message if still untitled
   -----------------------------------
  */

  if (!conversation.title || conversation.title === "New Conversation") {
    const messageCount = await db.chatMessage.count({
      where: { conversationId, role: "user" },
    });

    if (messageCount <= 1) {
      // Generate a short title from the first message
      const shortTitle = content.length > 50
        ? content.substring(0, 47).trimEnd() + "..."
        : content;

      await db.conversation.update({
        where: { id: conversationId },
        data: { title: shortTitle, updatedAt: new Date() },
      });
    }
  }

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
   SYNC ALLOCATION ACTUALS
   -----------------------------------
  */

  if (parsed.entries.length > 0) {
    try {
      const { DashboardEngine } = await import(
        "@/features/dashboard/services/dashboard-engine"
      );

            const allEntries = await db.entry.findMany({
              where: { userId: session.user.id },
              include: { category: { select: { name: true } } },
            });

      const engineEntries = allEntries.map((e) => ({
        type: e.type as string,
        amount: Number(e.amount),
        category: e.category?.name ?? "Uncategorized",
      }));

      await DashboardEngine.refreshAllocationActuals(
        session.user.id,
        engineEntries
      );
    } catch (e) {
      console.error("Failed to sync allocation actuals:", e);
    }
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

            // Sync BudgetAllocation.recommended to match the new operational budget
            const statedExpenses: { category: string; amount: number }[] = [
              { category: "Housing", amount: Number(expenseProfile?.rentHousing ?? 0) },
              { category: "Food", amount: Number(expenseProfile?.food ?? 0) },
              { category: "Transportation", amount: Number(expenseProfile?.transport ?? 0) },
              { category: "Utilities", amount: Number(expenseProfile?.utilities ?? 0) },
              { category: "Healthcare", amount: Number(expenseProfile?.healthCare ?? 0) },
              { category: "Education", amount: Number(expenseProfile?.schoolFees ?? 0) },
              { category: "Lifestyle", amount: Number(expenseProfile?.subscriptions ?? 0) },
              { category: "Misc", amount: Number(expenseProfile?.miscellaneousExpenses ?? 0) },
            ];

            const totalStated = statedExpenses.reduce((s, e) => s + e.amount, 0);
            const newOpBudget = Number(generated.operationalAllocation);

            if (totalStated > 0 && newOpBudget > 0) {
              const allocatableBudget = newOpBudget * 0.9;

              let updatedAllocations: { category: string; recommended: number }[];

              if (totalStated <= allocatableBudget) {
                // Use stated amounts directly
                updatedAllocations = statedExpenses.map((exp) => ({
                  category: exp.category,
                  recommended: Math.round(exp.amount),
                }));
              } else {
                // Scale down proportionally
                updatedAllocations = statedExpenses.map((exp) => {
                  const userRatio = exp.amount / totalStated;
                  return {
                    category: exp.category,
                    recommended: Math.round(allocatableBudget * userRatio),
                  };
                });
              }

              for (const item of updatedAllocations) {
                await db.budgetAllocation.updateMany({
                  where: { userId: session.user.id, category: item.category },
                  data: {
                    recommended: item.recommended,
                    percentage: newOpBudget > 0 ? item.recommended / newOpBudget : 0,
                  },
                });
              }

              const allocatedSum = updatedAllocations.reduce((s, a) => s + a.recommended, 0);
              const bufferRemaining = newOpBudget > allocatedSum ? newOpBudget - allocatedSum : 0;

              if (bufferRemaining > 0) {
                await db.budgetAllocation.updateMany({
                  where: { userId: session.user.id, category: "Emergency" },
                  data: { recommended: Math.round(bufferRemaining * 0.25) },
                });
                await db.budgetAllocation.updateMany({
                  where: { userId: session.user.id, category: "Family" },
                  data: { recommended: Math.round(bufferRemaining * 0.75) },
                });
              }
            }
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
     SAVE AI MESSAGE & UPDATE TIMESTAMP
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

      // Bump updatedAt so conversation sorts to top in history
      await db.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
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