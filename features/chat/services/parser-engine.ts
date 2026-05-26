import { EntryType } from "@prisma/client";

export type ParsedEntry = {
  type: EntryType;

  title: string;

  amount: number;

  category: string;
};

export class ParserEngine {
  /*
   -----------------------------------
   MAIN PARSER
   -----------------------------------
  */

  static parse(
    message: string
  ): ParsedEntry[] {
    const lower =
      message.toLowerCase();

    /*
     -----------------------------------
     EXTRACT AMOUNTS
     -----------------------------------
    */

    const amountMatches =
      [...lower.matchAll(/\d+/g)];

    if (
      amountMatches.length === 0
    ) {
      return [];
    }

    /*
     -----------------------------------
     CATEGORY DETECTION
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
    ];

    const detectedCategory =
      categories.find((category) =>
        lower.includes(category)
      ) || "general";

    /*
     -----------------------------------
     ENTRY TYPE
     -----------------------------------
    */

    let type: EntryType =
      EntryType.EXPENSE;

    if (
      lower.includes("salary") ||
      lower.includes("income") ||
      lower.includes("received")
    ) {
      type = EntryType.INCOME;
    }

    if (
      lower.includes(
        "investment"
      )
    ) {
      type =
        EntryType.INVESTMENT;
    }

    /*
     -----------------------------------
     BUILD ENTRIES
     -----------------------------------
    */

    const entries: ParsedEntry[] =
      amountMatches.map(
        (
          match
        ): ParsedEntry => ({
          type,

          title:
            detectedCategory
              .charAt(0)
              .toUpperCase() +
            detectedCategory.slice(
              1
            ),

          amount: Number(match[0]),

          category:
            detectedCategory,
        })
      );

    return entries;
  }
}