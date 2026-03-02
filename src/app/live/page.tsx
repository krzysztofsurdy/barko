"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { LiveIndicator } from "@/components/live-indicator";
import type { AIMessage, AIMessageContent } from "@/lib/types";

interface LiveMessage {
  uuid: string;
  type: "user" | "assistant";
  timestamp: string;
  content: unknown;
  model?: string;
}

function toLiveAIMessage(msg: LiveMessage): AIMessage {
  let content: AIMessageContent[] | string;
  if (typeof msg.content === "string") {
    content = msg.content;
  } else if (Array.isArray(msg.content)) {
    content = (msg.content as Record<string, unknown>[]).map((block) => ({
      type: (block.type as string) || "text",
      text: block.text as string | undefined,
      id: block.id as string | undefined,
      name: block.name as string | undefined,
      input: block.input as Record<string, unknown> | undefined,
      content: block.content as string | undefined,
      thinking: block.thinking as string | undefined,
    })) as AIMessageContent[];
  } else {
    content = String(msg.content || "");
  }

  return {
    uuid: msg.uuid,
    type: msg.type,
    sessionId: "",
    timestamp: msg.timestamp,
    content,
    model: msg.model,
  };
}

export default function LivePage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [paused, setPaused] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource("/api/live");
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.messages) {
          const newMsgs = (data.messages as LiveMessage[]).map(toLiveAIMessage);
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.uuid));
            const unique = newMsgs.filter((m) => !existingIds.has(m.uuid));
            if (unique.length === 0) return prev;
            return [...prev, ...unique];
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      setTimeout(connect, 5000);
    };

    return es;
  }, []);

  useEffect(() => {
    const es = connect();
    return () => es.close();
  }, [connect]);

  useEffect(() => {
    if (!paused) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, paused]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Live Tail
            <LiveIndicator active={connected && !paused} />
          </h1>
          <p className="text-foreground/50 text-sm mt-1">
            Most recent active conversation ({messages.length} messages)
          </p>
        </div>
        <button
          onClick={() => setPaused(!paused)}
          className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
            paused
              ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
              : "border-card-border text-foreground/50 hover:bg-card-bg"
          }`}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 text-foreground/40">
          Waiting for messages...
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.uuid || msg.timestamp} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
