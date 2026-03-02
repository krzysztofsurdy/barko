"use client";

import { useState, useEffect, useCallback } from "react";
import { ConfigViewer } from "@/components/config-viewer";
import { ConfigEditor } from "@/components/config-editor";
import { MCPServerCard } from "@/components/mcp-server-card";
import { EditIcon } from "@/components/icons";
import { useSSE } from "@/lib/use-sse";
import type { AIConfig, AIMCPServer } from "@/lib/types";

type Tab = "config" | "mcp";

export default function ConfigPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [mcpServers, setMcpServers] = useState<AIMCPServer[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>("claude");
  const [activeTab, setActiveTab] = useState<Tab>("config");
  const [editing, setEditing] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    const res = await fetch("/api/config");
    setConfigs(await res.json());
  }, []);

  const fetchMCP = useCallback(async () => {
    const res = await fetch("/api/agents");
    const data = await res.json();
    setMcpServers(data.mcpServers || []);
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchMCP();
  }, [fetchConfig, fetchMCP]);

  useSSE((event) => {
    if (event === "fileChange") {
      fetchConfig();
      fetchMCP();
    }
  });

  const providers = configs.map((c) => c.provider);
  const currentConfig = configs.find((c) => c.provider === activeProvider);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuration</h1>
        <p className="text-foreground/50 text-sm mt-1">
          AI agent configuration, rules, and MCP servers
        </p>
      </div>

      {providers.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground/40">Provider:</span>
          <div className="flex gap-2">
            {providers.map((provider) => (
              <button
                key={provider}
                onClick={() => setActiveProvider(provider)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                  activeProvider === provider
                    ? "bg-sidebar-active text-white"
                    : "bg-card-bg text-foreground/60 hover:text-foreground border border-card-border"
                }`}
              >
                {provider === "claude"
                  ? "Claude Code"
                  : provider === "gemini"
                    ? "Gemini CLI"
                    : provider === "cursor"
                      ? "Cursor"
                      : provider === "copilot"
                        ? "Copilot"
                        : provider}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-card-border pb-0">
        {(["config", "mcp"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-sidebar-active text-sidebar-active"
                : "border-transparent text-foreground/50 hover:text-foreground/70"
            }`}
          >
            {tab === "config" ? "Configuration" : `MCP Servers (${mcpServers.length})`}
          </button>
        ))}
      </div>

      {activeTab === "config" && currentConfig && (
        <div className="space-y-4">
          {editing === "globalClaudeMd" ? (
            <ConfigEditor
              file="globalClaudeMd"
              initialContent={currentConfig.globalRules || ""}
              onSaved={() => {
                setEditing(null);
                fetchConfig();
              }}
              onCancel={() => setEditing(null)}
            />
          ) : editing === "settings" ? (
            <ConfigEditor
              file="settings"
              initialContent={
                currentConfig.settings
                  ? JSON.stringify(currentConfig.settings, null, 2)
                  : "{}"
              }
              onSaved={() => {
                setEditing(null);
                fetchConfig();
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <ConfigViewer
                  title={
                    activeProvider === "claude"
                      ? "Global Rules (CLAUDE.md)"
                      : "Global Rules"
                  }
                  content={currentConfig.globalRules}
                  language="markdown"
                />
                <button
                  onClick={() => setEditing("globalClaudeMd")}
                  className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 text-xs rounded border border-card-border text-foreground/40 hover:text-foreground/70 hover:bg-background transition-colors"
                >
                  <EditIcon size={12} />
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <ConfigViewer
                    title="settings.json"
                    content={
                      currentConfig.settings
                        ? JSON.stringify(currentConfig.settings, null, 2)
                        : null
                    }
                    language="json"
                  />
                  {currentConfig.settings && (
                    <button
                      onClick={() => setEditing("settings")}
                      className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 text-xs rounded border border-card-border text-foreground/40 hover:text-foreground/70 hover:bg-background transition-colors"
                    >
                      <EditIcon size={12} />
                      Edit
                    </button>
                  )}
                </div>
                <ConfigViewer
                  title="settings.local.json"
                  content={
                    currentConfig.settingsLocal
                      ? JSON.stringify(currentConfig.settingsLocal, null, 2)
                      : null
                  }
                  language="json"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "config" && !currentConfig && (
        <div className="text-center py-16 text-foreground/40">
          No configuration found for this provider
        </div>
      )}

      {activeTab === "mcp" && (
        <div>
          {mcpServers.length === 0 ? (
            <div className="text-center py-16 text-foreground/40">
              No MCP servers configured
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mcpServers.map((server) => (
                <MCPServerCard
                  key={server.name}
                  name={server.name}
                  command={server.command}
                  args={server.args}
                  envKeys={server.envKeys}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
