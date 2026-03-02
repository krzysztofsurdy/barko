"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardStats } from "@/components/dashboard-stats";
import { TeamCard } from "@/components/team-card";
import { useSSE } from "@/lib/use-sse";
import { useNotifications } from "@/lib/use-notifications";
import { useTaskNotifications } from "@/lib/use-task-notifications";
import { useToast } from "@/components/toast";
import type { AIProcess, AITeam, AITask, AISkill } from "@/lib/types";

export default function DashboardPage() {
  const [processes, setProcesses] = useState<AIProcess[]>([]);
  const [teams, setTeams] = useState<AITeam[]>([]);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [skills, setSkills] = useState<AISkill[]>([]);
  const { notify } = useNotifications();
  const { addToast } = useToast();
  useTaskNotifications({ notify, addToast });

  const fetchData = useCallback(async () => {
    const [teamsRes, tasksRes, skillsRes] = await Promise.all([
      fetch("/api/teams"),
      fetch("/api/tasks"),
      fetch("/api/skills"),
    ]);
    setTeams(await teamsRes.json());
    setTasks(await tasksRes.json());
    setSkills(await skillsRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useSSE((event, data) => {
    if (event === "processes") {
      setProcesses(data as AIProcess[]);
    }
    if (event === "fileChange") {
      fetchData();
    }
  });

  const activeTaskCount = tasks.filter((t) => t.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Overview of all AI agent activity on this machine
        </p>
      </div>

      <DashboardStats
        processCount={processes.length}
        teamCount={teams.length}
        activeTaskCount={activeTaskCount}
        skillCount={skills.length}
      />

      {teams.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamCard
                key={team.name}
                name={team.name}
                description={team.description}
                members={team.members}
                createdAt={team.createdAt}
              />
            ))}
          </div>
        </div>
      )}

      {tasks.filter((t) => t.status === "in_progress").length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Tasks In Progress</h2>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status === "in_progress")
              .map((task) => (
                <div
                  key={`${task.teamName}-${task.id}`}
                  className="rounded-lg border border-card-border border-l-4 !border-l-accent-orange bg-card-bg p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-medium">{task.subject}</span>
                    <span className="text-xs text-foreground/40 ml-2">
                      {task.teamName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.owner && (
                      <span className="text-xs text-foreground/50">
                        {task.owner}
                      </span>
                    )}
                    <span className="h-2 w-2 rounded-full bg-status-working animate-pulse" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {processes.length === 0 && teams.length === 0 && (
        <div className="text-center py-16 text-foreground/40">
          <p className="text-lg">No AI agent activity detected</p>
          <p className="text-sm mt-1">
            Start a Claude Code session to see activity here
          </p>
        </div>
      )}
    </div>
  );
}
