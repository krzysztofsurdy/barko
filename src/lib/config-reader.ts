import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { PATHS } from "./claude-paths";

export interface ConfigData {
  globalClaudeMd: string | null;
  settings: Record<string, unknown> | null;
  settingsLocal: Record<string, unknown> | null;
}

export function getConfig(): ConfigData {
  return {
    globalClaudeMd: readFileSafe(PATHS.globalClaudeMd),
    settings: readJsonSafe(PATHS.settings),
    settingsLocal: readJsonSafe(PATHS.settingsLocal),
  };
}

function readFileSafe(path: string): string | null {
  if (!existsSync(path)) return null;
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function readJsonSafe(path: string): Record<string, unknown> | null {
  const content = readFileSafe(path);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

const FILE_MAP: Record<string, string> = {
  globalClaudeMd: PATHS.globalClaudeMd,
  settings: PATHS.settings,
};

export function backupConfig(file: string): string | null {
  const sourcePath = FILE_MAP[file];
  if (!sourcePath || !existsSync(sourcePath)) return null;

  const backupDir = join(dirname(sourcePath), ".barko-backups");
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = sourcePath.endsWith(".json") ? ".json" : ".md";
  const backupPath = join(backupDir, `${file}-${timestamp}${ext}`);
  copyFileSync(sourcePath, backupPath);
  return backupPath;
}

export function writeConfig(file: string, content: string): void {
  const targetPath = FILE_MAP[file];
  if (!targetPath) throw new Error(`Unknown config file: ${file}`);
  writeFileSync(targetPath, content, "utf-8");
}
