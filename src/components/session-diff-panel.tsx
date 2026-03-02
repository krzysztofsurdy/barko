"use client";

import { useState } from "react";
import { FileIcon } from "./icons";
import type { FileChange } from "@/lib/session-diff";

interface SessionDiffPanelProps {
  changes: FileChange[];
}

export function SessionDiffPanel({ changes }: SessionDiffPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (changes.length === 0) return null;

  const created = changes.filter((c) => c.operation === "created").length;
  const modified = changes.filter((c) => c.operation === "modified").length;

  return (
    <div className="rounded-lg border border-card-border bg-card-bg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-card-bg/50 transition-colors"
      >
        <FileIcon size={16} className="text-foreground/40 shrink-0" />
        <span className="font-medium">Files Changed</span>
        <span className="text-xs text-foreground/40">
          {changes.length} file{changes.length !== 1 ? "s" : ""}
          {created > 0 && (
            <span className="ml-1 text-accent-green">+{created}</span>
          )}
          {modified > 0 && (
            <span className="ml-1 text-accent-orange">~{modified}</span>
          )}
        </span>
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`ml-auto transition-transform text-foreground/30 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-card-border px-4 py-2 space-y-1">
          {changes.map((change) => (
            <div
              key={change.path}
              className="flex items-center gap-2 text-xs font-mono py-1"
            >
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium ${
                  change.operation === "created"
                    ? "bg-accent-green/15 text-accent-green"
                    : "bg-accent-orange/15 text-accent-orange"
                }`}
              >
                {change.operation === "created" ? "new" : "mod"}
              </span>
              <span className="text-foreground/60 truncate">{change.path}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
