"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/*
 -----------------------------------
 CREATE NEW CONVERSATION
-----------------------------------
*/

export async function createConversation() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const conversation = await db.conversation.create({
    data: {
      userId: session.user.id,
      title: "New Conversation",
    },
    include: {
      messages: true,
    },
  });

  return conversation;
}
