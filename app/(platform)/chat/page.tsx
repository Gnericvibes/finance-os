import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { ChatInterface } from "@/features/chat/components/chat-interface";

export default async function ChatPage() {
  /*
   -----------------------------------
   SESSION
   -----------------------------------
  */

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  /*
   -----------------------------------
   PROTECT ROUTE
   -----------------------------------
  */

  if (!session?.user) {
    redirect("/sign-in");
  }

  /*
   -----------------------------------
   FIND OR CREATE CONVERSATION
   -----------------------------------
  */

  let conversation =
    await db.conversation.findFirst({
      where: {
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
    conversation =
      await db.conversation.create({
        data: {
          userId: session.user.id,

          title: "New Conversation",
        },

        include: {
          messages: true,
        },
      });
  }

  /*
   -----------------------------------
   UI
   -----------------------------------
  */

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* HEADER */}

        <div className="border-b border-zinc-900 p-6">
                    <h1 className="text-4xl font-bold">
            FOS AI
          </h1>

          <p className="text-zinc-400 mt-2">
            AI-powered financial operating system
          </p>
        </div>

        {/* CHAT */}

        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={conversation.messages}
            conversationId={conversation.id}
          />
        </div>
      </div>
    </main>
  );
}