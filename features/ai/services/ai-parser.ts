import { EntryType } from "@prisma/client";

import { deepseek } from "@/lib/deepseek";

import type { ParsedEntry, ProfileUpdate } from "@/features/chat/services/parser-engine";

export type AIParseResult = {
  entries: ParsedEntry[];
  profileUpdates: ProfileUpdate | null;
};

export class AIParser {
  /*
   -----------------------------------
   PARSE WITH DEEPSEEK
   -----------------------------------
  */

  static async parse(
    userId: string,
    message: string
  ): Promise<AIParseResult | null> {
    try {
      /*
       -----------------------------------
       SYSTEM PROMPT
       -----------------------------------
      */

      const systemPrompt = `You are a financial data parser. Your ONLY job is to extract structured financial data from user messages.

AVAILABLE ENTRY TYPES (use these exact strings):
- INCOME: salary, freelance, business revenue, gifts received, refunds, bonuses, commissions, investment returns
- EXPENSE: spending on goods/services (food, transport, rent, shopping, utilities, subscriptions, healthcare, entertainment, school fees, misc)
- INVESTMENT: buying stocks, crypto, treasury bills, mutual funds, bonds, ETFs, real estate, any capital allocation
- DEBT_PAYMENT: repaying loans, paying off debt, paying someone back, clearing borrowed money, credit card payments, "paid [someone] [amount]"
- TRANSFER: moving money between accounts, wallets, savings transfers

RULES:
1. Extract ALL financial entries mentioned in the message.
2. Determine the CORRECT entry type based on context and intent.
3. "paid [name] [amount]" where the user pays another person → DEBT_PAYMENT (paying back someone)
4. "paid for [item/service]" → EXPENSE
5. "bought/invested in/purchased [investment instrument]" → INVESTMENT
6. "received/salary/earned" → INCOME
7. "bought [product]" → EXPENSE
8. Use a descriptive title that captures what happened (e.g., "Paid Ola", "Bought Treasury Bills", "Monthly Rent", "Freelance Payment")

RESPOND ONLY WITH VALID JSON. No explanations. No markdown. No backticks.

{
  "entries": [
    {
      "type": "ENTRY_TYPE",
      "title": "Short descriptive title",
      "amount": number,
      "category": "category name"
    }
  ],
  "profileUpdates": null | {
    "dependents": number,
    "maritalStatus": string,
    "totalDebt": number
  }
}`;

      /*
       -----------------------------------
       CALL DEEPSEEK
       -----------------------------------
      */

      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        console.warn("AI Parser: Empty response from DeepSeek");
        return null;
      }

      /*
       -----------------------------------
       PARSE JSON
       -----------------------------------
      */

      const parsed = JSON.parse(content);

      if (!parsed.entries || !Array.isArray(parsed.entries)) {
        console.warn("AI Parser: No entries in response");
        return null;
      }

      const entries: ParsedEntry[] = parsed.entries.map((entry: any) => ({
        type: validateEntryType(entry.type),
        title: String(entry.title || "Transaction"),
        amount: Number(entry.amount) || 0,
        category: String(entry.category || "general"),
      }));

      const profileUpdates: ProfileUpdate | null = parsed.profileUpdates
        ? {
            dependents: parsed.profileUpdates.dependents,
            maritalStatus: parsed.profileUpdates.maritalStatus,
            totalDebt: parsed.profileUpdates.totalDebt
              ? Number(parsed.profileUpdates.totalDebt)
              : undefined,
          }
        : null;

      return { entries, profileUpdates };
    } catch (error) {
      console.error("AI Parser Error:", error);
      return null;
    }
  }
}

/*
 -----------------------------------
 TYPE VALIDATOR
 -----------------------------------
*/

function validateEntryType(type: string): EntryType {
  const validTypes: EntryType[] = [
    "INCOME",
    "EXPENSE",
    "INVESTMENT",
    "DEBT_PAYMENT",
    "TRANSFER",
  ];

  const upper = type?.toUpperCase();

  if (validTypes.includes(upper as EntryType)) {
    return upper as EntryType;
  }

  return "EXPENSE";
}
