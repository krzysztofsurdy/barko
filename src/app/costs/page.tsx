"use client";

import { useState, useEffect, useCallback } from "react";
import { CostChart } from "@/components/cost-chart";
import type { CostSummary } from "@/lib/cost-calculator";

const ranges = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 9999 },
] as const;

function formatCost(n: number): string {
  if (n >= 100) return `$${n.toFixed(0)}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function CostsPage() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/costs?days=${days}`);
      setSummary(await res.json());
    } catch {
      setSummary(null);
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cost Tracking</h1>
          <p className="text-foreground/50 text-sm mt-1">
            Token usage and estimated costs
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-card-bg border border-card-border p-0.5">
          {ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                days === r.days
                  ? "bg-sidebar-active text-white"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-foreground/40">Loading...</div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Cost" value={formatCost(summary.totalCost)} />
            <StatCard label="Sessions" value={String(summary.sessionCount)} />
            <StatCard
              label="Input Tokens"
              value={formatTokens(summary.totalInputTokens)}
              sub={formatCost(summary.totalInputCost)}
            />
            <StatCard
              label="Output Tokens"
              value={formatTokens(summary.totalOutputTokens)}
              sub={formatCost(summary.totalOutputCost)}
            />
          </div>

          <div className="rounded-lg border border-card-border bg-card-bg p-4">
            <h2 className="text-sm font-medium text-foreground/50 mb-4">
              Daily Cost
              <span className="ml-2 inline-block w-3 h-2 rounded bg-blue-500/50" /> Input
              <span className="ml-2 inline-block w-3 h-2 rounded bg-purple-500/50" /> Output
            </h2>
            <CostChart data={summary.dailyCosts} />
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-foreground/40">
          No cost data available
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <div className="text-xs text-foreground/40 mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-foreground/40 mt-0.5">{sub}</div>}
    </div>
  );
}
