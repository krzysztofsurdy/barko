"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { CopyableId } from "@/components/copyable-id";
import { FavoriteButton } from "@/components/favorite-button";
import { ModelFilter } from "@/components/model-filter";
import { useFavorites } from "@/lib/use-favorites";
import type { AIConversationSession } from "@/lib/types";

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<AIConversationSession[]>([]);
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState<string | null>(null);
  const { toggle, isFavorite, favorites } = useFavorites();

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/conversations");
    setSessions(await res.json());
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const uniqueModels = useMemo(
    () =>
      [...new Set(sessions.map((s) => s.model).filter(Boolean) as string[])].sort(),
    [sessions]
  );

  const filtered = useMemo(() => {
    let result = sessions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.sessionId.toLowerCase().includes(q) ||
          s.projectPath.toLowerCase().includes(q)
      );
    }
    if (modelFilter) {
      result = result.filter((s) => s.model === modelFilter);
    }
    return result;
  }, [sessions, search, modelFilter]);

  const favoriteSessions = useMemo(
    () => filtered.filter((s) => isFavorite(s.sessionId)),
    [filtered, isFavorite, favorites]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, AIConversationSession[]>();
    for (const session of filtered) {
      const key = session.projectPath;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(session);
    }
    return Array.from(map.entries()).sort((a, b) => {
      const aLatest = a[1][0]?.startTime || "";
      const bLatest = b[1][0]?.startTime || "";
      return bLatest.localeCompare(aLatest);
    });
  }, [filtered]);

  function SessionTable({ rows }: { rows: AIConversationSession[] }) {
    return (
      <div className="rounded-lg border border-card-border bg-card-bg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border text-left text-xs text-foreground/40">
              <th className="py-2 px-3 w-8"></th>
              <th className="py-2 px-3">Session</th>
              <th className="py-2 px-3">Messages</th>
              <th className="py-2 px-3">Tokens</th>
              <th className="py-2 px-3">Started</th>
              <th className="py-2 px-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((session) => {
              const duration =
                session.startTime && session.endTime
                  ? Math.round(
                      (new Date(session.endTime).getTime() -
                        new Date(session.startTime).getTime()) /
                        60000
                    )
                  : null;

              return (
                <tr
                  key={session.sessionId}
                  className="border-b border-card-border hover:bg-card-bg/50 transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <FavoriteButton
                      active={isFavorite(session.sessionId)}
                      onClick={() => toggle(session.sessionId)}
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/conversations/${session.sessionId}?project=${encodeURIComponent(session.project)}`}
                        className="text-xs font-mono hover:text-sidebar-active transition-colors"
                      >
                        {session.sessionId.slice(0, 12)}...
                      </Link>
                      <CopyableId
                        value={session.sessionId}
                        truncate={0}
                        className="text-foreground/30"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-sm">
                    {session.messageCount}
                  </td>
                  <td className="py-2.5 px-3 text-xs font-mono text-foreground/50">
                    {formatTokens(
                      session.totalInputTokens + session.totalOutputTokens
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-foreground/50">
                    {session.startTime
                      ? new Date(session.startTime).toLocaleString()
                      : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-foreground/50">
                    {duration !== null ? `${duration}m` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Session history with full message content ({sessions.length} sessions)
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by session ID or project path..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 text-sm rounded-lg border border-card-border bg-card-bg focus:outline-none focus:border-sidebar-active"
        />
        <ModelFilter
          models={uniqueModels}
          selected={modelFilter}
          onChange={setModelFilter}
        />
      </div>

      {favoriteSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-accent-orange/70 mb-2 flex items-center gap-2">
            Bookmarked
          </h2>
          <SessionTable rows={favoriteSessions} />
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="text-center py-16 text-foreground/40">
          <p>No conversations found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([projectPath, projectSessions]) => (
            <div key={projectPath}>
              <h2 className="text-sm font-medium text-foreground/50 mb-2 font-mono truncate">
                {projectPath}
              </h2>
              <SessionTable rows={projectSessions} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
