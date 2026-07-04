import { deepseek } from "@/lib/deepseek";
import { FinancialContext } from "./financial-context";

export class AIAdvisor {
  /*
   -----------------------------------
   GENERATE FINANCIAL ADVICE
   -----------------------------------
  */

  static async generateAdvice(
    userId: string,
    userMessage: string,
    processedEntries: { type: string; title: string; amount: number; category: string }[]
  ): Promise<string> {
    try {
      /*
       -----------------------------------
       BUILD FINANCIAL CONTEXT
       -----------------------------------
      */

      const context = await FinancialContext.build(userId);

      const profile = context.profile;
      const blueprint = context.blueprint;
      const analytics = context.analytics;
      const budgets = context.budgets;

      /*
       -----------------------------------
       CALCULATE SUPPLEMENTARY METRICS
       -----------------------------------
      */

      const monthlyIncome = Number(profile?.monthlyIncome ?? 0);

      // Debt progress
      const totalDebt = Number(profile?.totalDebt ?? 0);
      const repaymentAmount = Number(profile?.repaymentAmount ?? 0);
      const monthsToDebtFree = repaymentAmount > 0 ? Math.ceil(totalDebt / repaymentAmount) : null;

      // PFOS targets
      const targetInvestmentAlloc = blueprint?.investmentPercentage ?? 0;
      const targetInvestmentAmount = (monthlyIncome * targetInvestmentAlloc) / 100;
      const actualInvestmentsThisMonth = analytics.investments;

      const targetDebtAlloc = blueprint?.debtPercentage ?? 0;
      const targetDebtAmount = (monthlyIncome * targetDebtAlloc) / 100;
      const actualDebtPaidThisMonth = await this.getMonthlyDebtPayments(userId);

      const targetEmergencyAlloc = blueprint?.emergencyPercentage ?? 0;
      const targetOperationalAlloc = blueprint?.operationalPercentage ?? 0;
      const actualExpensesThisMonth = analytics.expenses;

      // Was this message an entry (not just a question)?
      const isEntryMessage = processedEntries.length > 0;

      /*
       -----------------------------------
       SYSTEM PROMPT
       -----------------------------------
      */

      const systemPrompt = `You are Finance OS AI — a financial intelligence system embedded in a user's personal operating system.

YOUR ROLE:
- Analyze the user's financial behavior
- Alert them when they deviate from their PFOS (Personal Financial Operating System) blueprint
- Celebrate progress and milestones
- Give concise, actionable advice
- Be direct — no fluff, no generic motivation

CURRENT USER FINANCIAL STATE:
${JSON.stringify(
  {
    monthlyIncome,
    totalDebt,
    repaymentAmount,
    monthsToDebtFree,
    analytics: {
      totalIncome: analytics.income,
      totalExpenses: analytics.expenses,
      totalInvestments: analytics.investments,
      cashFlow: analytics.cashFlow,
      savingsRate: analytics.savingsRate,
    },
    pfosBlueprint: blueprint
      ? {
          mode: blueprint.blueprintMode,
          operationalAllocation: `${blueprint.operationalPercentage}% (₦${((monthlyIncome * blueprint.operationalPercentage) / 100).toLocaleString()})`,
          debtAllocation: `${blueprint.debtPercentage}% (₦${((monthlyIncome * blueprint.debtPercentage) / 100).toLocaleString()})`,
          investmentAllocation: `${blueprint.investmentPercentage}% (₦${((monthlyIncome * blueprint.investmentPercentage) / 100).toLocaleString()})`,
          emergencyAllocation: `${blueprint.emergencyPercentage}% (₦${((monthlyIncome * blueprint.emergencyPercentage) / 100).toLocaleString()})`,
          financialHealthScore: blueprint.financialHealthScore,
          isDebtFree: blueprint.isDebtFree,
        }
      : null,
    budgetStatus: budgets.length > 0 ? budgets : "No active budget set",
    actualThisMonth: {
      expenses: actualExpensesThisMonth,
      debtPayments: actualDebtPaidThisMonth,
      investments: actualInvestmentsThisMonth,
    },
    isEntryMessage,
  },
  null,
  2
)}

RESPONSE RULES:
1. If the user just made a transaction (isEntryMessage = true), acknowledge it first
2. Then check for these alerts in order:
   - OVER-BUDGET: if any budget categories are exceeded
   - MISSING INVESTMENT: if actual investments < target investment amount
   - MISSING DEBT PAYMENT: if actual debt payments < target debt amount
   - DEBT PROGRESS: if they're close to becoming debt-free (remaining debt < 3 months of payments)
   - SPENDING WARNING: if expenses exceed operational allocation
   - NEGATIVE CASHFLOW: if spending exceeds income
   - LOW SAVINGS RATE: if savings rate < 20%
3. End with the next best action they should take
4. Keep it under 4 sentences unless there are critical alerts
5. Be direct and specific — mention exact amounts

If the user is asking a question (isEntryMessage = false), answer their question based on their financial data.`;

      /*
       -----------------------------------
       CALL DEEPSEEK
       -----------------------------------
      */

      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      });

      return (
        response.choices[0]?.message?.content ||
        "I've processed your update. Your financial systems are operational."
      );
    } catch (error) {
      console.error("AI Advisor Error:", error);

      /*
       -----------------------------------
       FALLBACK — BASIC INSIGHTS
       -----------------------------------
      */

      return this.fallbackAdvice(userId, processedEntries);
    }
  }

  /*
   -----------------------------------
   FALLBACK ADVICE (WHEN AI IS DOWN)
   -----------------------------------
  */

  private static async fallbackAdvice(
    userId: string,
    processedEntries: { type: string; title: string; amount: number; category: string }[]
  ): Promise<string> {
    try {
      const context = await FinancialContext.build(userId);

      let advice = "";

      if (processedEntries.length > 0) {
        const total = processedEntries.reduce((s, e) => s + e.amount, 0);
        advice = `Processed ${processedEntries.length} entr${processedEntries.length > 1 ? "ies" : "y"} totaling ₦${total.toLocaleString()}.`;
      }

      // Budget alerts
      const overBudget = context.budgets.filter((b) => b.status === "OVER_BUDGET");
      if (overBudget.length > 0) {
        advice += ` ⚠️ ${overBudget[0].category} is over budget.`;
      }

      // Cash flow
      if (context.analytics.cashFlow < 0) {
        advice += " ⚠️ Cash flow is negative. Expenses exceed income.";
      }

      // Savings rate
      if (context.analytics.savingsRate < 20 && context.analytics.income > 0) {
        advice += ` 💡 Savings rate is ${context.analytics.savingsRate}%. Target is 20%+.`;
      }

      return advice || "Financial systems operational. No critical alerts.";
    } catch {
      if (processedEntries.length > 0) {
        const total = processedEntries.reduce((s, e) => s + e.amount, 0);
        return `Processed ${processedEntries.length} entr${processedEntries.length > 1 ? "ies" : "y"} totaling ₦${total.toLocaleString()}.`;
      }
      return "Financial systems operational.";
    }
  }

  /*
   -----------------------------------
   HELPER: GET MONTHLY DEBT PAYMENTS
   -----------------------------------
  */

  private static async getMonthlyDebtPayments(userId: string): Promise<number> {
    const { db } = await import("@/lib/db");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const entries = await db.entry.findMany({
      where: {
        userId,
        type: "DEBT_PAYMENT",
        createdAt: { gte: startOfMonth },
      },
    });

    return entries.reduce((sum, e) => sum + Number(e.amount), 0);
  }
}
