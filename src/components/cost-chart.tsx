"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyCost } from "@/lib/cost-calculator";

interface CostChartProps {
  data: DailyCost[];
}

export function CostChart({ data }: CostChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-foreground/40">
        No cost data available
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--foreground)" }}
            tickFormatter={(v: string) => v.slice(5)}
            stroke="var(--card-border)"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--foreground)" }}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            stroke="var(--card-border)"
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            /* eslint-disable @typescript-eslint/no-explicit-any */
            formatter={(value: any, name: any) => [
              `$${Number(value).toFixed(4)}`,
              name === "inputCost" ? "Input" : "Output",
            ]}
            labelFormatter={(label: any) => `Date: ${String(label)}`}
            /* eslint-enable @typescript-eslint/no-explicit-any */
          />
          <Area
            type="monotone"
            dataKey="inputCost"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            name="inputCost"
          />
          <Area
            type="monotone"
            dataKey="outputCost"
            stackId="1"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.3}
            name="outputCost"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
