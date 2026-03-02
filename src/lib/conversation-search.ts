import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { PATHS } from "./claude-paths";

export interface SearchResult {
  sessionId: string;
  project: string;
  projectPath: string;
  timestamp: string;
  role: "user" | "assistant";
  snippet: string;
  matchIndex: number;
}

function decodeProjectDir(dirName: string): string {
  return dirName.replace(/^-/, "/").replace(/-/g, "/");
}

function extractSnippet(text: string, query: string, contextChars = 80): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, contextChars * 2);
  const start = Math.max(0, idx - contextChars);
  const end = Math.min(text.length, idx + query.length + contextChars);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

function contentToPlainText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((block: Record<string, unknown>) => {
      if (block.type === "text") return (block.text as string) || "";
      if (block.type === "thinking") return (block.thinking as string) || (block.text as string) || "";
      return "";
    })
    .join(" ");
}

export function searchConversations(query: string, limit = 50): SearchResult[] {
  if (!query || query.length < 2 || !existsSync(PATHS.projects)) return [];

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  try {
    const projectDirs = readdirSync(PATHS.projects, { withFileTypes: true }).filter(
      (d) => d.isDirectory()
    );

    for (const dir of projectDirs) {
      if (results.length >= limit) break;

      const projectPath = join(PATHS.projects, dir.name);
      const files = readdirSync(projectPath).filter((f) => f.endsWith(".jsonl"));

      for (const file of files) {
        if (results.length >= limit) break;

        const sessionId = file.replace(".jsonl", "");
        const filePath = join(projectPath, file);

        try {
          const content = readFileSync(filePath, "utf-8");
          const lines = content.trim().split("\n").filter(Boolean);

          for (const line of lines) {
            if (results.length >= limit) break;

            try {
              const parsed = JSON.parse(line);
              if (parsed.type !== "user" && parsed.type !== "assistant") continue;

              const msgContent = parsed.message?.content || parsed.content || "";
              const plainText = contentToPlainText(msgContent);
              const matchIndex = plainText.toLowerCase().indexOf(lowerQuery);

              if (matchIndex === -1) continue;

              results.push({
                sessionId,
                project: dir.name,
                projectPath: decodeProjectDir(dir.name),
                timestamp: parsed.timestamp || "",
                role: parsed.type,
                snippet: extractSnippet(plainText, query),
                matchIndex,
              });
            } catch {
              // skip malformed line
            }
          }
        } catch {
          // skip malformed file
        }
      }
    }
  } catch {
    // return whatever we have
  }

  return results;
}
