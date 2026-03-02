import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { PATHS } from "./claude-paths";

const PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4-6": { input: 15.0, output: 75.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
  "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4.0 },
  "claude-3-opus-20240229": { input: 15.0, output: 75.0 },
  "claude-3-sonnet-20240229": { input: 3.0, output: 15.0 },
  "claude-3-haiku-20240307": { input: 0.25, output: 1.25 },
};

const DEFAULT_PRICING = { input: 3.0, output: 15.0 };

export interface DailyCost {
  date: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface CostSummary {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalInputCost: number;
  totalOutputCost: number;
  totalCost: number;
  dailyCosts: DailyCost[];
  sessionCount: number;
}

function getPricing(model: string): { input: number; output: number } {
  if (PRICING[model]) return PRICING[model];
  for (const key of Object.keys(PRICING)) {
    if (model.startsWith(key)) return PRICING[key];
  }
  return DEFAULT_PRICING;
}

export function calculateCosts(days = 30): CostSummary {
  if (!existsSync(PATHS.projects)) {
    return { totalInputTokens: 0, totalOutputTokens: 0, totalInputCost: 0, totalOutputCost: 0, totalCost: 0, dailyCosts: [], sessionCount: 0 };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  const dailyMap = new Map<string, { inputTokens: number; outputTokens: number; inputCost: number; outputCost: number }>();
  let sessionCount = 0;

  try {
    const projectDirs = readdirSync(PATHS.projects, { withFileTypes: true }).filter(
      (d) => d.isDirectory()
    );

    for (const dir of projectDirs) {
      const projectPath = join(PATHS.projects, dir.name);
      const files = readdirSync(projectPath).filter((f) => f.endsWith(".jsonl"));

      for (const file of files) {
        const filePath = join(projectPath, file);
        let sessionCounted = false;

        try {
          const content = readFileSync(filePath, "utf-8");
          const lines = content.trim().split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (!parsed.timestamp || parsed.timestamp < cutoffStr) continue;
              if (!parsed.message?.usage) continue;

              const model = parsed.message?.model || "unknown";
              const pricing = getPricing(model);

              const inputTokens =
                (parsed.message.usage.input_tokens || 0) +
                (parsed.message.usage.cache_read_input_tokens || 0);
              const outputTokens = parsed.message.usage.output_tokens || 0;

              const inputCost = (inputTokens / 1_000_000) * pricing.input;
              const outputCost = (outputTokens / 1_000_000) * pricing.output;

              const date = parsed.timestamp.slice(0, 10);
              const existing = dailyMap.get(date) || {
                inputTokens: 0,
                outputTokens: 0,
                inputCost: 0,
                outputCost: 0,
              };

              existing.inputTokens += inputTokens;
              existing.outputTokens += outputTokens;
              existing.inputCost += inputCost;
              existing.outputCost += outputCost;
              dailyMap.set(date, existing);

              if (!sessionCounted) {
                sessionCounted = true;
                sessionCount++;
              }
            } catch {
              // skip
            }
          }
        } catch {
          // skip
        }
      }
    }
  } catch {
    // return whatever we have
  }

  const dailyCosts: DailyCost[] = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date,
      ...data,
      totalCost: data.inputCost + data.outputCost,
    }));

  const totalInputTokens = dailyCosts.reduce((s, d) => s + d.inputTokens, 0);
  const totalOutputTokens = dailyCosts.reduce((s, d) => s + d.outputTokens, 0);
  const totalInputCost = dailyCosts.reduce((s, d) => s + d.inputCost, 0);
  const totalOutputCost = dailyCosts.reduce((s, d) => s + d.outputCost, 0);

  return {
    totalInputTokens,
    totalOutputTokens,
    totalInputCost,
    totalOutputCost,
    totalCost: totalInputCost + totalOutputCost,
    dailyCosts,
    sessionCount,
  };
}
