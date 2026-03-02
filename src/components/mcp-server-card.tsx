"use client";

import { useState } from "react";
import { CopyableId } from "./copyable-id";

interface MCPServerCardProps {
  name: string;
  command: string;
  args: string[];
  envKeys: string[];
}

export function MCPServerCard({
  name,
  command,
  args,
  envKeys,
}: MCPServerCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="rounded-lg border border-card-border bg-card-bg p-4 cursor-pointer hover:border-sidebar-active/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={`transition-transform shrink-0 text-foreground/30 ${expanded ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <h3 className="font-semibold text-sm">{name}</h3>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green">
          MCP
        </span>
      </div>
      <div className="text-xs text-foreground/50">
        <span className="text-foreground/40">Command: </span>
        <span className="font-mono text-foreground/70">{command}</span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-card-border text-xs text-foreground/50 space-y-1.5">
          {args.length > 0 && (
            <div>
              <span className="text-foreground/40">Args: </span>
              <div className="font-mono text-foreground/70 mt-0.5 space-y-0.5">
                {args.map((arg, i) => (
                  <div key={i} className="break-all">
                    {arg}
                  </div>
                ))}
              </div>
            </div>
          )}
          {envKeys.length > 0 && (
            <div>
              <span className="text-foreground/40">Environment variables: </span>
              <div className="mt-0.5 space-y-0.5">
                {envKeys.map((key) => (
                  <div key={key} className="flex items-center gap-1">
                    <CopyableId
                      value={key}
                      className="text-[10px] text-foreground/60"
                    />
                    <span className="text-foreground/30">= ****</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-foreground/40">Full command:</span>
            <CopyableId
              value={[command, ...args].join(" ")}
              truncate={60}
              className="text-foreground/60"
            />
          </div>
        </div>
      )}
    </div>
  );
}
