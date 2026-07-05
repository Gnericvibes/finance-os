"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/*
 -----------------------------------
 LOAD CONVERSATION BY ID
-----------------------------------
*/

export async function loadConversation(conversationId: string) {
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
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
}
