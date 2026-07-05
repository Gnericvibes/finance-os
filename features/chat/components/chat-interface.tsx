"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { sendMessage } from "@/features/chat/actions/send-message";
import { clearChat } from "@/features/chat/actions/clear-chat";
import { createConversation } from "@/features/chat/actions/create-conversation";
import { getChatHistory } from "@/features/chat/actions/get-chat-history";
import { loadConversation } from "@/features/chat/actions/load-conversation";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
  conversationId: string;
}

interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { messages: number };
}

interface ChatInterfaceProps {
  messages: Message[];
  conversationId: string;
}

export function ChatInterface({
  messages: initialMessages,
  conversationId: initialConversationId,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load conversation history when sidebar opens
  useEffect(() => {
    if (sidebarOpen && conversations.length === 0) {
      loadHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen]);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const history = await getChatHistory();
      setConversations(history);
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    setLoadingHistory(false);
  }

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

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    try {
      const result = await sendMessage(conversationId, currentInput);

      if (!result?.success) {
        throw new Error("Failed to get AI response");
      }

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.response,
        createdAt: new Date(),
        conversationId,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm having trouble processing your request. Please try again.",
        createdAt: new Date(),
        conversationId,
      };

      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  }

  async function handleClearChat() {
    try {
      const result = await clearChat(conversationId);
      if (result.success && result.newConversation) {
        setConversationId(result.newConversation.id);
        setMessages(result.newConversation.messages);
        setConversations([]); // Refresh history next time sidebar opens
      }
    } catch (e) {
      console.error("Failed to clear chat:", e);
    }
  }

  async function handleNewChat() {
    try {
      const conv = await createConversation();
      setConversationId(conv.id);
      setMessages(conv.messages);
      setConversations([]);
    } catch (e) {
      console.error("Failed to create new conversation:", e);
    }
  }

  async function handleLoadConversation(id: string) {
    try {
      const conv = await loadConversation(id);
      setConversationId(conv.id);
      setMessages(conv.messages);
      setSidebarOpen(false);
    } catch (e) {
      console.error("Failed to load conversation:", e);
    }
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* SIDEBAR */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Panel */}
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Chat History</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingHistory ? (
                <p className="text-center text-zinc-500 py-8 text-sm">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="text-center text-zinc-500 py-8 text-sm">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleLoadConversation(conv.id)}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                      conv.id === conversationId
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <div className="font-medium truncate">
                      {conv.title || "Untitled"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {conv._count.messages} message{conv._count.messages !== 1 ? "s" : ""} —{" "}
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* TOP BAR */}
      <div className="border-b border-zinc-900 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => {
            setSidebarOpen(true);
            loadHistory();
          }}
          className="text-zinc-400 hover:text-white text-sm flex items-center gap-2"
          title="Chat history"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="hidden sm:inline">History</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={handleNewChat}
          className="text-zinc-400 hover:text-white text-sm flex items-center gap-2"
          title="New conversation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">New</span>
        </button>

        <button
          onClick={handleClearChat}
          className="text-zinc-400 hover:text-red-400 text-sm flex items-center gap-2"
          title="Clear conversation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 pt-20">
            Start a conversation with FOS AI
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-3xl rounded-2xl p-4 ${
                message.role === "assistant"
                  ? "bg-zinc-900 border border-zinc-800"
                  : "bg-white text-black ml-auto"
              }`}
            >
              <p className="text-sm mb-2 opacity-70">
                {message.role === "assistant" ? "FOS AI" : "You"}
              </p>
              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-zinc-900 p-6">
        <div className="flex gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your financial update..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 outline-none focus:border-white"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-white text-black px-6 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}