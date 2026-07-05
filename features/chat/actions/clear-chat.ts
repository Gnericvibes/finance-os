"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/*
 -----------------------------------
 CLEAR CHAT MESSAGES
 -----------------------------------
 Clears messages and creates a fresh conversation.
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

  // Create a fresh conversation for the user to continue
  const newConversation = await db.conversation.create({
    data: {
      userId: session.user.id,
      title: "New Conversation",
    },
    include: {
      messages: true,
    },
  });

  return { success: true, newConversation };
}
