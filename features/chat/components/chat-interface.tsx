"use client";

import { useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatInterface() {
  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: "1",
        role: "assistant",
        content:
          "Welcome to Finance OS. Tell me about your finances.",
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  async function handleSend() {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setMessage("");

    setLoading(true);

    /*
     -----------------------------------
     TEMP AI RESPONSE
     -----------------------------------
    */

    setTimeout(() => {
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I analyzed your financial input. AI engine integration comes next.",
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

      setLoading(false);
    }, 1000);
  }

  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl h-[700px] flex flex-col overflow-hidden">
      {/* HEADER */}

      <div className="border-b border-zinc-800 p-6">
        <h2 className="text-2xl font-bold text-white">
          Finance AI
        </h2>

        <p className="text-zinc-400 text-sm mt-1">
          Your autonomous financial operating
          system
        </p>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                msg.role === "user"
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-white border border-zinc-800"
              }`}
            >
              <p className="leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
              <p className="text-zinc-400">
                Thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}

      <div className="border-t border-zinc-800 p-4">
        <div className="flex gap-3">
          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Tell Finance OS about your finances..."
            className="flex-1 bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-white transition"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-white text-black px-6 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}