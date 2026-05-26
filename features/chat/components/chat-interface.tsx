"use client";

import { useState } from "react";

import { sendMessage } from "@/features/chat/actions/send-message";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
  conversationId: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  conversationId: string;
}

export function ChatInterface({
  messages: initialMessages,
  conversationId,
}: ChatInterfaceProps) {
  const [messages, setMessages] =
    useState(initialMessages);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    setLoading(true);

    const userMessage = {
      id: crypto.randomUUID(),

      role: "user",

      content: input,

      createdAt: new Date(),

      conversationId,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    const currentInput = input;

    setInput("");

    try {
      await sendMessage(
        conversationId,
        currentInput
      );

      const assistantMessage = {
        id: crypto.randomUUID(),

        role: "assistant",

        content:
          "Message received. AI orchestration layer will be connected next.",

        createdAt: new Date(),

        conversationId,
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <div className="h-full flex flex-col">
      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 pt-20">
            Start a conversation with Finance AI
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-3xl rounded-2xl p-4 ${
                message.role ===
                "assistant"
                  ? "bg-zinc-900 border border-zinc-800"
                  : "bg-white text-black ml-auto"
              }`}
            >
              <p className="text-sm mb-2 opacity-70">
                {message.role ===
                "assistant"
                  ? "Finance AI"
                  : "You"}
              </p>

              <p className="leading-relaxed">
                {message.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* INPUT */}

      <div className="border-t border-zinc-900 p-6">
        <div className="flex gap-4">
          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder="Type your financial update..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 outline-none focus:border-white"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-white text-black px-6 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}