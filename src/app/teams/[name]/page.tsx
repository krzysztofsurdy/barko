"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { CopyableId } from "@/components/copyable-id";
import { AgentTimeline } from "@/components/agent-timeline";
import { buildTeamTimeline } from "@/lib/timeline-builder";
import { useSSE } from "@/lib/use-sse";
import type { AITeam, AITask } from "@/lib/types";

export default function TeamDetailPage() {
  const params = useParams();
  const teamName = decodeURIComponent(params.name as string);
  const [team, setTeam] = useState<AITeam | null>(null);
  const [tasks, setTasks] = useState<AITask[]>([]);

  const fetchData = useCallback(async () => {
    const [teamsRes, tasksRes] = await Promise.all([
      fetch("/api/teams"),
      fetch(`/api/tasks?team=${encodeURIComponent(teamName)}`),
    ]);
    const teams = await teamsRes.json();
    setTeam(teams.find((t: AITeam) => t.name === teamName) || null);
    setTasks(await tasksRes.json());
  }, [teamName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useSSE((event) => {
    if (event === "fileChange") fetchData();
  });

  if (!team) {
    return (
      <div className="text-center py-16 text-foreground/40">
        <p>Team &quot;{teamName}&quot; not found</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const colorMap: Record<string, string> = {
    blue: "bg-accent-teal",
    red: "bg-accent-pink",
    green: "bg-accent-green",
    yellow: "bg-accent-yellow",
    purple: "bg-accent-purple",
    orange: "bg-accent-orange",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{team.name}</h1>
        {team.description && (
          <p className="text-foreground/50 text-sm mt-1">{team.description}</p>
        )}
      </div>

      {/* Members */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Members ({team.members.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {team.members.map((member) => (
            <div
              key={member.agentId}
              className="rounded-lg border border-card-border bg-card-bg p-3"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    colorMap[member.color || ""] || "bg-slate-500"
                  }`}
                >
                  {member.name
                    .split("-")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-sm">{member.name}</div>
                  <div className="text-xs text-foreground/40">
                    {member.agentType}
                  </div>
                  <CopyableId
                    value={member.agentId}
                    truncate={20}
                    className="text-[10px] text-foreground/30"
                  />
                </div>
              </div>
              {member.model && (
                <div className="text-xs text-foreground/40">
                  Model: {member.model}
                </div>
              )}
              {member.cwd && (
                <div className="text-xs text-foreground/40 font-mono truncate">
                  {member.cwd}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agent Timeline */}
      <AgentTimeline timeline={buildTeamTimeline(team, tasks)} />

      {/* Task Board */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending column */}
          <div>
            <h3 className="text-sm font-medium text-foreground/50 mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-status-pending" />
              Pending ({pendingTasks.length})
            </h3>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* In Progress column */}
          <div>
            <h3 className="text-sm font-medium text-foreground/50 mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-status-working animate-pulse" />
              In Progress ({inProgressTasks.length})
            </h3>
            <div className="space-y-2">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Completed column */}
          <div>
            <h3 className="text-sm font-medium text-foreground/50 mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-status-completed" />
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: AITask }) {
  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-3">
      <div className="flex items-center justify-between mb-1">
        <CopyableId value={task.id} label="#" className="text-foreground/40" />
        <StatusBadge status={task.status} />
      </div>
      <div className="text-sm font-medium">{task.subject}</div>
      {task.owner && (
        <div className="text-xs text-foreground/40 mt-1">
          Owner: {task.owner}
        </div>
      )}
      {task.blockedBy.length > 0 && (
        <div className="text-xs text-accent-pink mt-1">
          Blocked by: {task.blockedBy.join(", ")}
        </div>
      )}
    </div>
  );
}
