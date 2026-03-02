"use client";

import { useState, useCallback } from "react";

interface CopyableIdProps {
  value: string;
  truncate?: number;
  label?: string;
  className?: string;
}

export function CopyableId({
  value,
  truncate,
  label,
  className = "",
}: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [value]
  );

  const display = truncate && value.length > truncate
    ? `${value.slice(0, truncate)}...`
    : value;

  return (
    <button
      onClick={handleCopy}
      title={`${value}\nClick to copy`}
      className={`inline-flex items-center gap-1 font-mono text-xs hover:text-sidebar-active transition-colors cursor-pointer ${className}`}
    >
      {label && <span className="text-foreground/40 font-sans">{label}</span>}
      <span>{display}</span>
      {copied ? (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent-green shrink-0"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-30 shrink-0"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
