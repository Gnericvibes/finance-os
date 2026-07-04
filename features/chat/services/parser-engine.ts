import { EntryType } from "@prisma/client";

export type ParsedEntry = {
  type: EntryType;
  title: string;
  amount: number;
  category: string;
};

export type ProfileUpdate = {
  dependents?: number;
  maritalStatus?: string;
  totalDebt?: number;
};

export type ParsedResult = {
  entries: ParsedEntry[];
  profileUpdates: ProfileUpdate | null;
  detectedIntent: "ENTRY" | "PROFILE_UPDATE" | "UNKNOWN";
  aiResponse: string;
};

export class ParserEngine {
  /*
   -----------------------------------
   MAIN PARSER
   -----------------------------------
  */

  static parse(message: string): ParsedResult {
    const lower = message.toLowerCase();

    /*
     -----------------------------------
     PROFILE UPDATE DETECTION
     -----------------------------------
    */

    const profileUpdates: ProfileUpdate = {};
    let detectedIntent: "ENTRY" | "PROFILE_UPDATE" | "UNKNOWN" = "UNKNOWN";

    const dependentMatch = lower.match(/(\d+)\s+dependent/);
    if (dependentMatch) {
      profileUpdates.dependents = Number(dependentMatch[1]);
      detectedIntent = "PROFILE_UPDATE";
    }

    if (lower.includes("got married") || lower.includes("married")) {
      profileUpdates.maritalStatus = "MARRIED";
      detectedIntent = "PROFILE_UPDATE";
    }

    const debtTakeMatch = lower.match(/(?:have|took|taken|owe|owed|borrowed|got|have\sa)\s+(\d+)\s+(?:debt|loan)/i);
    if (debtTakeMatch) {
      profileUpdates.totalDebt = Number(debtTakeMatch[1]);
      detectedIntent = "PROFILE_UPDATE";
    }

    /*
     -----------------------------------
     EXTRACT AMOUNTS
     -----------------------------------
    */

    const amountMatches = [...lower.matchAll(/\d+/g)];

    /*
     -----------------------------------
     CATEGORY LIST
     -----------------------------------
    */

    const categories = [
      "food", "transport", "data", "rent", "shopping",
      "investment", "salary", "airtime", "entertainment",
      "health", "groceries", "fuel", "internet", "subscription",
      "debt", "loan", "crypto", "stocks",
      "treasury bills", "mutual funds", "bonds", "etfs", "real estate",
    ];

    /*
     -----------------------------------
     ADVANCED TYPE DETECTION
     -----------------------------------
    */

    // Investment instruments
    const investmentKeywords = ["treasury bills", "mutual funds", "bonds", "etfs", "stocks", "crypto", "real estate", "invested", "investing", "invest"];
    const investmentInstruments = ["treasury bills", "mutual funds", "bonds", "etfs", "stocks", "crypto", "real estate"];
    const hasInvestmentContext = investmentKeywords.some((kw) => lower.includes(kw));

    // Income triggers
    const hasIncomeKeywords = lower.includes("salary") || lower.includes("earned") || lower.includes("freelance") || lower.includes("bonus") || lower.includes("commission");

    // Debt triggers
    const hasDebtKeywords = lower.includes("debt") || lower.includes("loan") || lower.includes("repayment") || lower.includes("borrowed") || lower.includes("owe") || lower.includes("owed") || lower.includes("repay");

    // "bought [something]" + investment instrument → investment
    const boughtInvestment = lower.includes("bought") && investmentInstruments.some((inst) => lower.includes(inst));

    // "paid [someone] [amount]" without any category = expense (general payment)
    // But "paid [someone]" + debt keywords = debt payment
    const paidMatch = lower.match(/paid\s+(?:\w+\s+)?(\d+)/i);
    const hasPaid = paidMatch !== null;

    // "received / got / earned [amount]" = income
    const receivedMatch = lower.match(/(?:received|got|earned|credited)\s+(?:\w+\s+)?(\d+)/i);
    const hasReceived = receivedMatch !== null;

    /*
     -----------------------------------
     MULTI CATEGORY PARSING
     -----------------------------------
    */

    const entries: ParsedEntry[] = [];

    categories.forEach((category) => {
      const regex = new RegExp(`(\\d+)\\s*${category}`, "gi");
      const matches = [...lower.matchAll(regex)];

      matches.forEach((match) => {
        let type: EntryType = EntryType.EXPENSE;

        if (category === "salary" || lower.includes("income") || lower.includes("received")) {
          type = EntryType.INCOME;
        }

        if (["investment", "crypto", "stocks", "treasury bills", "mutual funds", "bonds", "etfs", "real estate"].includes(category)) {
          type = EntryType.INVESTMENT;
        }

        if (["debt", "loan"].includes(category)) {
          type = EntryType.DEBT_PAYMENT;
        }

        entries.push({
          type,
          title: category.charAt(0).toUpperCase() + category.slice(1),
          amount: Number(match[1]),
          category,
        });
      });
    });

    /*
     -----------------------------------
     FALLBACK PARSING
     -----------------------------------
    */

    if (entries.length === 0 && amountMatches.length > 0) {
      const detectedCategory = categories.find((category) => lower.includes(category)) || "general";

      let type: EntryType = EntryType.EXPENSE;
      let title = detectedCategory.charAt(0).toUpperCase() + detectedCategory.slice(1);
      const amount = Number(amountMatches[0][0]);

      // Type detection priority: explicit keywords > context clues
      if (lower.includes("salary") || lower.includes("income") || lower.includes("received") || hasIncomeKeywords || hasReceived) {
        type = EntryType.INCOME;
        if (detectedCategory === "general") {
          title = "Income";
        }
      } else if (lower.includes("investment") || hasInvestmentContext || boughtInvestment) {
        type = EntryType.INVESTMENT;
        if (detectedCategory === "general" && investmentInstruments.some((inst) => lower.includes(inst))) {
          const found = investmentInstruments.find((inst) => lower.includes(inst));
          if (found) {
            title = found.charAt(0).toUpperCase() + found.slice(1);
          }
        }
      } else if (hasDebtKeywords || (hasPaid && hasDebtKeywords)) {
        type = EntryType.DEBT_PAYMENT;
        if (detectedCategory === "general") {
          title = "Debt Repayment";
        }
      } else if (hasPaid && detectedCategory === "general") {
        // "paid [someone] [amount]" with no expense category → debt repayment
        type = EntryType.DEBT_PAYMENT;
        title = "Debt Repayment";
      }

      entries.push({
        type,
        title,
        amount,
        category: detectedCategory,
      });
    }

    /*
     -----------------------------------
     ENTRY INTENT
     -----------------------------------
    */

    if (entries.length > 0) {
      detectedIntent = "ENTRY";
    }

    /*
     -----------------------------------
     AI RESPONSE GENERATION
     -----------------------------------
    */

    let aiResponse = "I could not fully understand your financial update.";

    if (detectedIntent === "ENTRY") {
      const total = entries.reduce((acc, entry) => acc + entry.amount, 0);
      aiResponse = `Processed ${entries.length} financial entr${entries.length > 1 ? "ies" : "y"} totaling ₦${total.toLocaleString()}.`;
    }

    if (detectedIntent === "PROFILE_UPDATE") {
      aiResponse = "Profile update detected. Your PFOS blueprint will be recalculated.";
    }

    /*
     -----------------------------------
     RETURN
     -----------------------------------
    */

    return {
      entries,
      profileUpdates: Object.keys(profileUpdates).length > 0 ? profileUpdates : null,
      detectedIntent,
      aiResponse,
    };
  }
}
