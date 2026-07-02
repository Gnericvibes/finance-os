import OpenAI from "openai";

import { FinancialContext } from "./financial-context";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AIContext = Awaited<ReturnType<typeof FinancialContext.build>>;


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

${JSON.stringify(context, null, 2)}

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
            model: "gpt-4.1-mini",

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