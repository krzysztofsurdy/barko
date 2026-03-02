"use client";

import Link from "next/link";

interface SearchResultCardProps {
  sessionId: string;
  project: string;
  projectPath: string;
  timestamp: string;
  role: "user" | "assistant";
  snippet: string;
  query: string;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const parts: { text: string; highlight: boolean }[] = [];
  const lower = text.toLowerCase();
  const lowerQ = query.toLowerCase();
  let lastIdx = 0;

  let idx = lower.indexOf(lowerQ, lastIdx);
  while (idx !== -1) {
    if (idx > lastIdx) {
      parts.push({ text: text.slice(lastIdx, idx), highlight: false });
    }
    parts.push({ text: text.slice(idx, idx + query.length), highlight: true });
    lastIdx = idx + query.length;
    idx = lower.indexOf(lowerQ, lastIdx);
  }
  if (lastIdx < text.length) {
    parts.push({ text: text.slice(lastIdx), highlight: false });
  }

  return (
    <>
      {parts.map((p, i) =>
        p.highlight ? (
          <mark key={i} className="bg-yellow-400/30 text-foreground rounded px-0.5">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

export function SearchResultCard({
  sessionId,
  project,
  projectPath,
  timestamp,
  role,
  snippet,
  query,
}: SearchResultCardProps) {
  return (
    <Link
      href={`/conversations/${sessionId}?project=${encodeURIComponent(project)}`}
      className="block rounded-lg border border-card-border bg-card-bg p-3 hover:border-sidebar-active/40 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            role === "user"
              ? "bg-sidebar-active/15 text-sidebar-active"
              : "bg-foreground/10 text-foreground/50"
          }`}
        >
          {role}
        </span>
        <span className="text-xs font-mono text-foreground/40">
          {sessionId.slice(0, 12)}
        </span>
        {timestamp && (
          <span className="text-xs text-foreground/30">
            {new Date(timestamp).toLocaleString()}
          </span>
        )}
      </div>
      <div className="text-sm text-foreground/70 whitespace-pre-wrap line-clamp-3">
        {highlightMatch(snippet, query)}
      </div>
      <div className="text-xs text-foreground/30 font-mono mt-1.5 truncate">
        {projectPath}
      </div>
    </Link>
  );
}
