import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join } from "path";
import { PATHS } from "./claude-paths";

export interface LiveMessage {
  uuid: string;
  type: "user" | "assistant";
  timestamp: string;
  content: unknown;
  model?: string;
}

function findMostRecentJsonl(): string | null {
  if (!existsSync(PATHS.projects)) return null;

  let newestFile: string | null = null;
  let newestMtime = 0;

  try {
    const projectDirs = readdirSync(PATHS.projects, { withFileTypes: true }).filter(
      (d) => d.isDirectory()
    );

    for (const dir of projectDirs) {
      const projectPath = join(PATHS.projects, dir.name);
      const files = readdirSync(projectPath).filter((f) => f.endsWith(".jsonl"));

      for (const file of files) {
        const filePath = join(projectPath, file);
        try {
          const stat = statSync(filePath);
          if (stat.mtimeMs > newestMtime) {
            newestMtime = stat.mtimeMs;
            newestFile = filePath;
          }
        } catch {
          // skip
        }
      }
    }
  } catch {
    // return null
  }

  return newestFile;
}

export function getLatestMessages(sinceTimestamp?: string, limit = 20): {
  messages: LiveMessage[];
  filePath: string | null;
} {
  const filePath = findMostRecentJsonl();
  if (!filePath) return { messages: [], filePath: null };

  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);

    const messages: LiveMessage[] = [];

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.type !== "user" && parsed.type !== "assistant") continue;

        if (sinceTimestamp && parsed.timestamp && parsed.timestamp <= sinceTimestamp) {
          continue;
        }

        messages.push({
          uuid: parsed.uuid || "",
          type: parsed.type,
          timestamp: parsed.timestamp || "",
          content: parsed.message?.content || parsed.content || "",
          model: parsed.message?.model || parsed.model,
        });
      } catch {
        // skip
      }
    }

    return {
      messages: messages.slice(-limit),
      filePath,
    };
  } catch {
    return { messages: [], filePath };
  }
}
