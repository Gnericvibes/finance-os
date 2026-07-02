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

  detectedIntent:
    | "ENTRY"
    | "PROFILE_UPDATE"
    | "UNKNOWN";

  aiResponse: string;
};

export class ParserEngine {
  /*
   -----------------------------------
   MAIN PARSER
   -----------------------------------
  */

  static parse(
    message: string
  ): ParsedResult {
    const lower =
      message.toLowerCase();

    /*
     -----------------------------------
     PROFILE UPDATE DETECTION
     -----------------------------------
    */

    const profileUpdates: ProfileUpdate =
      {};

    let detectedIntent:
      | "ENTRY"
      | "PROFILE_UPDATE"
      | "UNKNOWN" =
      "UNKNOWN";

    /*
     -----------------------------------
     DEPENDENTS
     -----------------------------------
    */

    const dependentMatch =
      lower.match(
        /(\d+)\s+dependent/
      );

    if (dependentMatch) {
      profileUpdates.dependents =
        Number(
          dependentMatch[1]
        );

      detectedIntent =
        "PROFILE_UPDATE";
    }

    /*
     -----------------------------------
     MARRIAGE DETECTION
     -----------------------------------
    */

        if (
      lower.includes(
        "got married"
      ) ||
      lower.includes("married")
    ) {
      profileUpdates.maritalStatus =
        "MARRIED";

      detectedIntent =
        "PROFILE_UPDATE";
    }

    /*
     -----------------------------------
     DEBT PROFILE DETECTION
     -----------------------------------
     "I have/took/owe/got/borrowed 5000 debt/loan" → profile update
     "I paid/repaid/paid off 2000 debt/loan" → financial entry (DEBT_PAYMENT)
    */

    const debtTakeMatch =
      lower.match(
        /(?:have|took|taken|owe|owed|borrowed|got|have\sa)\s+(\d+)\s+(?:debt|loan)/i
      );

    if (debtTakeMatch) {
      profileUpdates.totalDebt =
        Number(
          debtTakeMatch[1]
        );

      detectedIntent =
        "PROFILE_UPDATE";
    }

    /*
     -----------------------------------
     EXTRACT AMOUNTS
     -----------------------------------
    */

    const amountMatches =
      [...lower.matchAll(/\d+/g)];

    /*
     -----------------------------------
     CATEGORY LIST
     -----------------------------------
    */

    const categories = [
      "food",
      "transport",
      "data",
      "rent",
      "shopping",
      "investment",
      "salary",
      "airtime",
      "entertainment",
      "health",
      "groceries",
      "fuel",
      "internet",
      "subscription",
      "debt",
      "loan",
      "crypto",
      "stocks",
    ];

    /*
     -----------------------------------
     MULTI CATEGORY PARSING
     -----------------------------------
    */

    const entries: ParsedEntry[] =
      [];

    categories.forEach(
      (category) => {
        const regex =
          new RegExp(
            `(\\d+)\\s*${category}`,
            "gi"
          );

        const matches = [
          ...lower.matchAll(
            regex
          ),
        ];

        matches.forEach(
          (match) => {
            let type: EntryType =
              EntryType.EXPENSE;

            /*
             -----------------------------------
             TYPE DETECTION
             -----------------------------------
            */

            if (
              category ===
                "salary" ||
              lower.includes(
                "income"
              ) ||
              lower.includes(
                "received"
              )
            ) {
              type =
                EntryType.INCOME;
            }

            if (
              [
                "investment",
                "crypto",
                "stocks",
              ].includes(
                category
              )
            ) {
              type =
                EntryType.INVESTMENT;
            }

            if (
              [
                "debt",
                "loan",
              ].includes(
                category
              )
            ) {
              type =
                EntryType.DEBT_PAYMENT;
            }

            entries.push({
              type,

              title:
                category
                  .charAt(0)
                  .toUpperCase() +
                category.slice(
                  1
                ),

              amount: Number(
                match[1]
              ),

              category,
            });
          }
        );
      }
    );

    /*
     -----------------------------------
     FALLBACK PARSING
     -----------------------------------
    */

    if (
      entries.length === 0 &&
      amountMatches.length > 0
    ) {
      const detectedCategory =
        categories.find(
          (category) =>
            lower.includes(
              category
            )
        ) || "general";

      let type: EntryType =
        EntryType.EXPENSE;

      if (
        lower.includes(
          "salary"
        ) ||
        lower.includes(
          "income"
        ) ||
        lower.includes(
          "received"
        )
      ) {
        type =
          EntryType.INCOME;
      }

      if (
        lower.includes(
          "investment"
        )
      ) {
        type =
          EntryType.INVESTMENT;
      }

      entries.push({
        type,

        title:
          detectedCategory
            .charAt(0)
            .toUpperCase() +
          detectedCategory.slice(
            1
          ),

        amount: Number(
          amountMatches[0][0]
        ),

        category:
          detectedCategory,
      });
    }

    /*
     -----------------------------------
     ENTRY INTENT
     -----------------------------------
    */

    if (
      entries.length > 0
    ) {
      detectedIntent =
        "ENTRY";
    }

    /*
     -----------------------------------
     AI RESPONSE GENERATION
     -----------------------------------
    */

    let aiResponse =
      "I could not fully understand your financial update.";

    /*
     -----------------------------------
     ENTRY RESPONSE
     -----------------------------------
    */

    if (
      detectedIntent ===
      "ENTRY"
    ) {
      const total =
        entries.reduce(
          (
            acc,
            entry
          ) =>
            acc +
            entry.amount,
          0
        );

      aiResponse = `Processed ${entries.length} financial entr${
        entries.length > 1
          ? "ies"
          : "y"
      } totaling ₦${total.toLocaleString()}.`;
    }

    /*
     -----------------------------------
     PROFILE RESPONSE
     -----------------------------------
    */

    if (
      detectedIntent ===
      "PROFILE_UPDATE"
    ) {
      aiResponse =
        "Profile update detected. Your PFOS blueprint will be recalculated.";
    }

    /*
     -----------------------------------
     RETURN
     -----------------------------------
    */

    return {
      entries,

      profileUpdates:
        Object.keys(
          profileUpdates
        ).length > 0
          ? profileUpdates
          : null,

      detectedIntent,

      aiResponse,
    };
  }
}