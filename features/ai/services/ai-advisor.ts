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
      const context = await FinancialContext.build(userId);

      const profile = context.profile;
      const blueprint = context.blueprint;
      const analytics = context.analytics;
      const budgets = context.budgets;
      const allocationComparisons = context.allocationComparisons;
      const allocationAlerts = context.allocationAlerts;
      const currencySymbol = context.currencySymbol;

      const monthlyIncome = Number(profile?.monthlyIncome ?? 0);
      const totalDebt = Number(profile?.totalDebt ?? 0);
      const repaymentAmount = Number(profile?.repaymentAmount ?? 0);
      const monthsToDebtFree = repaymentAmount > 0 ? Math.ceil(totalDebt / repaymentAmount) : null;

      const actualInvestmentsThisMonth = analytics.investments;
      const actualDebtPaidThisMonth = await this.getMonthlyDebtPayments(userId);
      const actualExpensesThisMonth = analytics.expenses;

      // Non-negotiable: at least 10% of income goes to self-payment (investments)
      const MIN_INVESTMENT_RATE = 0.10;
      const minimumTargetInvestment = monthlyIncome * MIN_INVESTMENT_RATE;

      const isEntryMessage = processedEntries.length > 0;
      const isReviewRequest = !isEntryMessage && this.isFinancialReviewRequest(userMessage);
      
      // =========================================
      // MODE 1: ENTRY ACKNOWLEDGEMENT (short)
      // =========================================
      
      if (isEntryMessage) {
        const total = processedEntries.reduce((s, e) => s + e.amount, 0);
        const count = processedEntries.length;
        let response = `Recorded ${count} entr${count > 1 ? "ies" : "y"} totaling ${currencySymbol}${total.toLocaleString()}.`;

        for (const entry of processedEntries) {
          const alloc = allocationComparisons.find(
            (a) => a.category.toLowerCase() === entry.category.toLowerCase()
          );
          if (alloc && (alloc.status === "OVER" || alloc.status === "CRITICAL")) {
            response += ` ⚠️ You've now spent ${currencySymbol}${alloc.actual.toLocaleString()} on ${alloc.category} this month — ${alloc.differencePercentage}% above your ${currencySymbol}${alloc.recommended.toLocaleString()} budget.`;
          }
        }

        return response;
      }

      // =========================================
      // MODE 2: FINANCIAL REVIEW (detailed)
      // =========================================

      if (isReviewRequest) {
        const systemPrompt = `You are FOS AI — the user's personal financial intelligence system.

The user is asking for a financial review. Give them a clear, structured summary.

RESPONSE STRUCTURE:
1. Brief overall status (1 short sentence)
2. Income & spending overview
3. Budget category breakdown — only call out categories that are OVER or CRITICAL (overspent)
4. Investment status — remind them about the non-negotiable 10% self-payment rule. If they haven't invested at least 10% of income this month, encourage it.
5. Debt progress (if applicable)
6. One clear next action

RULES:
- Use plain, natural language. No jargon like "PFOS", "allocation", or "blueprint".
- UNDER or ON_TRACK = good, don't flag.
- OVER or CRITICAL = problem, call it out.
- Keep it concise but thorough.

CURRENT STATE (all amounts in ${currencySymbol}${profile?.currency || "NGN"}):
${JSON.stringify({
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
  budgetBreakdown: allocationComparisons.map(a => ({
    category: a.category,
    monthlyBudget: a.recommended,
    spentSoFar: a.actual,
    status: a.status,
  })),
  overspendingAlerts: allocationAlerts,
  thisMonth: {
    expenses: actualExpensesThisMonth,
    debtPayments: actualDebtPaidThisMonth,
    investments: actualInvestmentsThisMonth,
  },
  minimumInvestmentRequired: minimumTargetInvestment,
  currency: profile?.currency || "NGN",
  currencySymbol,
}, null, 2)}`;

        const response = await deepseek.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
        });

        return response.choices[0]?.message?.content || "Here's your financial overview.";
      }

      // =========================================
      // MODE 3: GENERAL QUESTION
      // =========================================

      const systemPrompt = `You are FOS AI. Answer the user's question based on their financial data. Be clear and direct.

CURRENT STATE (all amounts in ${currencySymbol}${profile?.currency || "NGN"}):
${JSON.stringify({
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
  budgetComparisons: allocationComparisons.map(a => ({
    category: a.category,
    budget: a.recommended,
    spent: a.actual,
    status: a.status,
  })),
  thisMonth: {
    expenses: actualExpensesThisMonth,
    debtPayments: actualDebtPaidThisMonth,
    investments: actualInvestmentsThisMonth,
  },
  currency: profile?.currency || "NGN",
  currencySymbol,
}, null, 2)}`;

      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || "I've processed your question.";
    } catch (error) {
      console.error("AI Advisor Error:", error);
      return this.fallbackAdvice(userId, processedEntries);
    }
  }

  /*
   -----------------------------------
   DETECT FINANCIAL REVIEW REQUEST
   -----------------------------------
  */

  private static isFinancialReviewRequest(message: string): boolean {
    const reviewKeywords = [
      "review", "summary", "overview", "how am i doing", "status update",
      "financial review", "check in", "progress report", "how are my finances",
      "breakdown", "give me a run down", "financial health", "health check",
      "where do i stand", "how is my budget", "budget review", "spending review",
      "performance", "monthly review", "financial advice", "what do you think",
      "analyse", "analyze", "tell me about my finances",
    ];
    const lower = message.toLowerCase().trim();
    return reviewKeywords.some((kw) => lower.includes(kw));
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
      const cs = context.currencySymbol;

      if (processedEntries.length > 0) {
        const total = processedEntries.reduce((s, e) => s + e.amount, 0);
        const count = processedEntries.length;
        let response = `Recorded ${count} entr${count > 1 ? "ies" : "y"} totaling ${cs}${total.toLocaleString()}.`;

        // Check for overspend on this specific entry's category
        for (const entry of processedEntries) {
          const alloc = context.allocationComparisons.find(
            (a) => a.category.toLowerCase() === entry.category.toLowerCase()
          );
          if (alloc && (alloc.status === "OVER" || alloc.status === "CRITICAL")) {
            response += ` ⚠️ You've now spent ${cs}${alloc.actual.toLocaleString()} on ${alloc.category} this month — ${alloc.differencePercentage}% above your ${cs}${alloc.recommended.toLocaleString()} budget.`;
          }
        }

        return response;
      }

      return "Financial systems operational.";
    } catch {
      const cs = "₦";
      if (processedEntries.length > 0) {
        const total = processedEntries.reduce((s, e) => s + e.amount, 0);
        return `Recorded ${processedEntries.length} entr${processedEntries.length > 1 ? "ies" : "y"} totaling ${cs}${total.toLocaleString()}.`;
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
