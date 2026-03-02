"use client";

import type { TeamTimeline } from "@/lib/timeline-builder";

const colorMap: Record<string, string> = {
  blue: "bg-accent-teal",
  red: "bg-accent-pink",
  green: "bg-accent-green",
  yellow: "bg-accent-yellow",
  purple: "bg-accent-purple",
  orange: "bg-accent-orange",
  slate: "bg-foreground/30",
};

const statusColorMap: Record<string, string> = {
  completed: "bg-status-completed",
  in_progress: "bg-status-working",
  pending: "bg-status-pending",
};

interface AgentTimelineProps {
  timeline: TeamTimeline;
}

export function AgentTimeline({ timeline }: AgentTimelineProps) {
  if (timeline.agents.length === 0) return null;

  const maxTasks = Math.max(...timeline.agents.map((a) => a.tasks.length), 1);

  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <h3 className="text-sm font-medium text-foreground/50 mb-4">Agent Timeline</h3>
      <div className="space-y-3">
        {timeline.agents.map((agent) => (
          <div key={agent.name} className="flex items-center gap-3">
            <div className="w-28 shrink-0 flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${colorMap[agent.color] || colorMap.slate}`}
              />
              <span className="text-xs font-medium truncate">{agent.name}</span>
            </div>
            <div className="flex-1 flex gap-1 items-center">
              {agent.tasks.length === 0 ? (
                <span className="text-xs text-foreground/30 italic">No tasks</span>
              ) : (
                agent.tasks.map((task) => (
                  <div
                    key={task.id}
                    title={`#${task.id}: ${task.subject} (${task.status})`}
                    className={`h-6 rounded text-[10px] text-white flex items-center px-2 truncate ${
                      statusColorMap[task.status] || statusColorMap.pending
                    }`}
                    style={{
                      width: `${Math.max(100 / maxTasks, 15)}%`,
                      opacity: task.status === "pending" ? 0.5 : 1,
                    }}
                  >
                    #{task.id}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-[10px] text-foreground/40">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-status-completed" /> Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-status-working" /> In Progress
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-status-pending opacity-50" /> Pending
        </span>
      </div>
    </div>
  );
}
