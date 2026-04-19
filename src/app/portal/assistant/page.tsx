"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

const TOOL_LABELS: Record<string, string> = {
  findPerformances: "Searching performances",
  getPerformance: "Reading performance details",
  createPerformance: "Creating performance",
  addIncomeLine: "Adding income",
  updateIncomeLine: "Updating income",
  addExpenseLine: "Adding expense",
  updateExpenseLine: "Updating expense",
  queryAnalytics: "Running analytics",
};

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-light text-white">Assistant</h1>
        <p className="text-cream-dim/60 text-sm mt-1">
          Tell her about your shows. She'll find them, check for duplicates, and update the ledger.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-bg-card border border-border rounded-lg p-6 space-y-6">
        {messages.length === 0 ? (
          <Welcome />
        ) : (
          messages.map((m) => <Message key={m.id} message={m} />)
        )}

        {status === "submitted" && (
          <div className="flex items-center gap-2 text-cream-dim/50 text-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold/60 animate-pulse" />
            Thinking…
          </div>
        )}

        {error && (
          <div className="border border-red-400/30 bg-red-400/5 rounded p-4 text-sm text-red-400">
            Something went wrong. {error.message || "Try again."}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. I made $31 in tips last night at Rumors"
          disabled={isBusy}
          className="flex-1 bg-bg-card border border-border rounded px-4 py-3 text-cream text-sm focus:border-gold-dim focus:outline-none disabled:opacity-60"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={stop}
            className="border border-red-400/30 text-red-400/80 hover:bg-red-400/10 rounded px-5 py-3 text-sm tracking-wider uppercase transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-5 py-3 text-sm tracking-wider uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}

function Welcome() {
  const samples = [
    "I made $31 in tips last night at Rumors.",
    "Add $75 makeup + $40 nails for my Janet promo show.",
    "I have a Rumors show next month — base pay $200, probably $150 tips.",
    "How much did I net in March?",
    "Which of my personas has been most profitable this year?",
  ];
  return (
    <div className="py-8">
      <p className="text-cream-dim/70 text-sm mb-4">Try something like:</p>
      <ul className="space-y-2">
        {samples.map((s) => (
          <li key={s} className="text-cream-dim/50 text-sm italic">
            "{s}"
          </li>
        ))}
      </ul>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-gold/10 border border-gold/20 text-cream"
            : "bg-bg-deep border border-border text-cream"
        }`}
      >
        {isAssistant && (
          <div className="text-gold-dim text-[10px] tracking-widest uppercase mb-2">Assistant</div>
        )}
        <div className="space-y-2 text-sm leading-relaxed">
          {message.parts.map((part, i) => <MessagePart key={i} part={part} />)}
        </div>
      </div>
    </div>
  );
}

function MessagePart({ part }: { part: UIMessage["parts"][number] }) {
  if (part.type === "text") {
    return <div className="whitespace-pre-wrap">{part.text}</div>;
  }
  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
    const toolName = part.type.slice("tool-".length);
    const label = TOOL_LABELS[toolName] ?? toolName;
    const p = part as unknown as { state?: string };
    const state = p.state;
    const done = state === "output-available" || state === "output-error";
    return (
      <div className="flex items-center gap-2 text-cream-dim/50 text-xs italic">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            done ? "bg-emerald-400/60" : "bg-gold/60 animate-pulse"
          }`}
        />
        {label}
        {done ? "" : "…"}
      </div>
    );
  }
  return null;
}
