"use client";

import { useEffect, useRef } from "react";

interface LogViewerProps {
  content: string;
  autoScroll?: boolean;
}

export function LogViewer({ content, autoScroll = true }: LogViewerProps) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (autoScroll && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [content, autoScroll]);

  return (
    <pre
      ref={ref}
      className="text-xs font-mono bg-sidebar-bg text-accent-green rounded-md p-4 overflow-auto max-h-[600px] whitespace-pre-wrap"
    >
      {content || "No log content"}
    </pre>
  );
}
