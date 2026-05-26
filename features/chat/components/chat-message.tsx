interface ChatMessageProps {
  role: string;
  content: string;
}

export function ChatMessage({
  role,
  content,
}: ChatMessageProps) {
  const isUser =
    role === "user";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-3xl px-5 py-4 border ${
          isUser
            ? "bg-white text-black border-white"
            : "bg-zinc-950 text-white border-zinc-800"
        }`}
      >
        <p className="text-sm leading-7 whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}