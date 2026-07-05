"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/*
 -----------------------------------
 GET CHAT HISTORY
 Returns all conversations for the current user
-----------------------------------
*/

export async function getChatHistory() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const conversations = await db.conversation.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return conversations;
}
