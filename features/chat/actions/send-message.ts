"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { ParserEngine } from "@/features/chat/services/parser-engine";

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
    throw new Error("Unauthorized");
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
   PARSE MESSAGE
   -----------------------------------
  */

  const parsedEntries =
    ParserEngine.parse(content);

  /*
   -----------------------------------
   SAVE STRUCTURED ENTRIES
   -----------------------------------
  */

  if (parsedEntries.length > 0) {
    await db.entry.createMany({
      data: parsedEntries.map(
        (entry) => ({
          type: entry.type,

          title: entry.title,

          amount: entry.amount,

          category: entry.category,

          userId: session.user.id,
        })
      ),
    });
  }

  /*
   -----------------------------------
   AI RESPONSE
   -----------------------------------
  */

  let response =
    "I could not detect any financial transaction.";

  if (parsedEntries.length > 0) {
    const total =
      parsedEntries.reduce(
        (acc, entry) =>
          acc + entry.amount,
        0
      );

    response = `Successfully recorded ${parsedEntries.length} financial entr${
      parsedEntries.length > 1
        ? "ies"
        : "y"
    } totaling ₦${total.toLocaleString()}.`;
  }

  /*
   -----------------------------------
   SAVE ASSISTANT MESSAGE
   -----------------------------------
  */

  await db.chatMessage.create({
    data: {
      role: "assistant",

      content: response,

      conversationId,
    },
  });

  /*
   -----------------------------------
   RETURN
   -----------------------------------
  */

  return {
    success: true,
  };
}