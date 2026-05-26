export class ConversationMemory {
  static compress(
    messages: {
      role: string;
      content: string;
    }[]
  ) {
    /*
     -----------------------------------
     KEEP LAST MESSAGES
     -----------------------------------
    */

    const recent =
      messages.slice(-8);

    /*
     -----------------------------------
     SIMPLE SUMMARY
     -----------------------------------
    */

    const summary =
      messages
        .slice(0, -8)
        .map(
          (m) =>
            `${m.role}: ${m.content}`
        )
        .join(" | ")
        .slice(0, 500);

    return {
      summary,
      recent,
    };
  }
}