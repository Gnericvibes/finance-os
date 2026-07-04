"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/*
 -----------------------------------
 CLEAR CHAT MESSAGES
 -----------------------------------
 Only deletes chat messages, NOT entries or financial data.
-----------------------------------
*/

export async function clearChat(conversationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      userId: session.user.id,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Delete only chat messages — entries, budgets, profiles remain untouched
  await db.chatMessage.deleteMany({
    where: {
      conversationId,
    },
  });

  return { success: true };
}
