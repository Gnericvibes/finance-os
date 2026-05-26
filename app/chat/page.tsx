import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { ChatInterface } from "@/features/chat/components/chat-interface";

export default async function ChatPage() {
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold">
            Finance AI
          </h1>

          <p className="text-zinc-400 mt-2 text-lg">
            Conversational financial intelligence
          </p>
        </div>

        <ChatInterface />
      </div>
    </main>
  );
}