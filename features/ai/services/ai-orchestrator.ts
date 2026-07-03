import { openai, AI_MODEL } from "@/lib/openai";

import { FinancialContext } from "./financial-context";

type AIContext = Awaited<ReturnType<typeof FinancialContext.build>>;

// Only the financial signals the model needs - never the raw profile row.
// Strips personally identifying fields (name, ids, timestamps) before the
// context ever leaves our server for a third-party LLM.
function redactContextForPrompt(context: AIContext) {
  return {
    stage: context.blueprint?.blueprintMode ?? "UNKNOWN",
    currency: context.profile?.currency ?? "NGN",
    allocationTargets: context.blueprint
      ? {
          operationalPercentage: context.blueprint.operationalPercentage,
          debtPercentage: context.blueprint.debtPercentage,
          investmentPercentage: context.blueprint.investmentPercentage,
          emergencyPercentage: context.blueprint.emergencyPercentage,
          financialHealthScore: context.blueprint.financialHealthScore,
        }
      : null,
    analytics: context.analytics,
    budgets: context.budgets,
  };
}


export class AIOrchestrator {
  /*
   -----------------------------------
   MAIN RESPONSE ENGINE
   -----------------------------------
  */

  static async generateResponse(
    userId: string,
    message: string
  ) {
    /*
     -----------------------------------
     FINANCIAL CONTEXT
     -----------------------------------
    */

    const context =
      await FinancialContext.build(
        userId
      );

    /*
     -----------------------------------
     SYSTEM PROMPT
     -----------------------------------
    */

    const systemPrompt = `
You are Finance OS AI.

You are an elite financial intelligence system.

Your job:
- analyze user finances
- identify overspending
- monitor financial discipline
- detect financial pressure
- guide the user toward long-term wealth

You must:
- be concise
- be analytical
- be practical
- avoid generic motivation
- give actionable recommendations

USER FINANCIAL PROFILE:

${JSON.stringify(redactContextForPrompt(context), null, 2)}

`;

    /*
     -----------------------------------
     OPENAI RESPONSE
     -----------------------------------
    */

    try {
      const response =
        await openai.chat.completions.create(
          {
            model: AI_MODEL,

            messages: [
              {
                role: "system",

                content:
                  systemPrompt,
              },

              {
                role: "user",

                content: message,
              },
            ],

            temperature: 0.7,
          }
        );

      return (
        response.choices[0]
          .message.content ||
        "No response generated."
      );
    } catch (error) {
      console.error(error);

      /*
       -----------------------------------
       FALLBACK ENGINE
       -----------------------------------
      */

      return this.fallbackResponse(
        context
      );
    }
  }

  /*
   -----------------------------------
   FALLBACK RESPONSE
   -----------------------------------
  */

    static fallbackResponse(context: AIContext) {
    const overBudget = context.budgets.filter(
      (budget) => budget.status === "OVER_BUDGET"
    );


    if (overBudget.length > 0) {
      return `
You are currently over budget in ${overBudget.length} categories.

Primary issue:
${overBudget[0].category}

Reduce spending immediately to stabilize monthly cash flow.
`;
    }

    if (
      context.analytics.cashFlow < 0
    ) {
      return `
Your cash flow is currently negative.

Expenses exceed income.

Immediate expense reduction is recommended.
`;
    }

    return `
Financial systems operational.

No critical budget pressure detected.
`;
  }
}