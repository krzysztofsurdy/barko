"use client";

import { useState, useEffect, useRef } from "react";
import { SearchIcon } from "@/components/icons";
import { SearchResultCard } from "@/components/search-result-card";
import type { SearchResult } from "@/lib/conversation-search";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`);
        setResults(await res.json());
      } catch {
        setResults([]);
      }
      setLoading(false);
      setSearched(true);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Full-text search across all conversations
        </p>
      </div>

      <div className="relative max-w-xl">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30"
        />
        <input
          type="text"
          placeholder="Search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-card-border bg-card-bg focus:outline-none focus:border-sidebar-active"
          autoFocus
        />
      </div>

      {loading && (
        <div className="text-sm text-foreground/40">Searching...</div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12 text-foreground/40">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-foreground/40">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
          {results.map((r, i) => (
            <SearchResultCard
              key={`${r.sessionId}-${i}`}
              sessionId={r.sessionId}
              project={r.project}
              projectPath={r.projectPath}
              timestamp={r.timestamp}
              role={r.role}
              snippet={r.snippet}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}
