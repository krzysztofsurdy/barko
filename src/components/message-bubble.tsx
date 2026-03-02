"use client";

import { useState } from "react";
import { CopyableId } from "./copyable-id";
import type { AIMessage, AIMessageContent } from "@/lib/types";

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function ToolUseBlock({
  block,
}: {
  block: AIMessageContent;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded border border-card-border bg-background/50 my-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-card-bg/50 transition-colors"
      >
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="font-mono font-medium text-sidebar-active">
          {block.name || "tool_use"}
        </span>
        {block.id && (
          <span className="text-foreground/30 font-mono">{block.id.slice(0, 12)}</span>
        )}
      </button>
      {expanded && block.input && (
        <div className="px-3 pb-2 border-t border-card-border">
          <pre className="text-xs font-mono text-foreground/60 overflow-x-auto whitespace-pre-wrap mt-2 max-h-80 overflow-y-auto">
            {JSON.stringify(block.input, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function ThinkingBlock({ block }: { block: AIMessageContent }) {
  const [expanded, setExpanded] = useState(false);
  const text = block.thinking || block.text || "";

  return (
    <div className="rounded border border-accent-yellow/20 bg-accent-yellow/5 my-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-accent-yellow/10 transition-colors"
      >
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="font-medium text-accent-yellow/80">Thinking</span>
        <span className="text-foreground/30">{text.length} chars</span>
      </button>
      {expanded && (
        <div className="px-3 pb-2 border-t border-accent-yellow/20">
          <pre className="text-xs font-mono text-foreground/50 overflow-x-auto whitespace-pre-wrap mt-2 max-h-80 overflow-y-auto">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

function renderContent(content: AIMessageContent[] | string) {
  if (typeof content === "string") {
    return (
      <div className="text-sm whitespace-pre-wrap break-words">{content}</div>
    );
  }

  return (
    <div>
      {content.map((block, i) => {
        if (block.type === "tool_use") {
          return <ToolUseBlock key={i} block={block} />;
        }
        if (block.type === "thinking") {
          return <ThinkingBlock key={i} block={block} />;
        }
        if (block.type === "tool_result") {
          return (
            <div key={i} className="text-xs font-mono text-foreground/40 my-1 px-2 py-1 bg-card-bg rounded">
              {typeof block.content === "string"
                ? block.content.slice(0, 500)
                : "[result]"}
            </div>
          );
        }
        // text block
        return (
          <div key={i} className="text-sm whitespace-pre-wrap break-words">
            {block.text || ""}
          </div>
        );
      })}
    </div>
  );
}

export function MessageBubble({ message }: { message: AIMessage }) {
  if (message.type === "file-history-snapshot") return null;

  const isUser = message.type === "user";
  const totalInput =
    (message.usage?.input_tokens || 0) +
    (message.usage?.cache_read_input_tokens || 0);
  const totalOutput = message.usage?.output_tokens || 0;

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-sidebar-active/15 border border-sidebar-active/20"
            : "bg-card-bg border border-card-border"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className={`text-xs font-medium ${
              isUser ? "text-sidebar-active" : "text-foreground/60"
            }`}
          >
            {isUser ? "User" : "Assistant"}
          </span>
          {message.model && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/40 font-mono">
              {message.model}
            </span>
          )}
          {message.timestamp && (
            <span className="text-[10px] text-foreground/30">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          )}
          {message.uuid && (
            <CopyableId
              value={message.uuid}
              truncate={8}
              className="text-[10px] text-foreground/20"
            />
          )}
        </div>

        {/* Content */}
        {renderContent(message.content)}

        {/* Token usage footer */}
        {(totalInput > 0 || totalOutput > 0) && (
          <div className="mt-2 pt-2 border-t border-card-border/50 flex gap-3 text-[10px] text-foreground/30">
            {totalInput > 0 && (
              <span>In: {formatTokens(totalInput)}</span>
            )}
            {totalOutput > 0 && (
              <span>Out: {formatTokens(totalOutput)}</span>
            )}
            {message.usage?.cache_read_input_tokens ? (
              <span>
                Cache: {formatTokens(message.usage.cache_read_input_tokens)}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
