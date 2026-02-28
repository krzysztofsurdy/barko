import { type ReactNode } from "react";
import { ProcessIcon, TeamsIcon, TasksIcon, SkillsIcon } from "./icons";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-foreground/50 text-sm">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

interface DashboardStatsProps {
  processCount: number;
  teamCount: number;
  activeTaskCount: number;
  skillCount: number;
}

export function DashboardStats({
  processCount,
  teamCount,
  activeTaskCount,
  skillCount,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Active Processes"
        value={processCount}
        icon={<ProcessIcon size={20} className="text-status-active" />}
      />
      <StatCard
        label="Teams"
        value={teamCount}
        icon={<TeamsIcon size={20} className="text-sidebar-active" />}
      />
      <StatCard
        label="Tasks In Progress"
        value={activeTaskCount}
        icon={<TasksIcon size={20} className="text-status-working" />}
      />
      <StatCard
        label="Installed Skills"
        value={skillCount}
        icon={<SkillsIcon size={20} className="text-purple-500" />}
      />
    </div>
  );
}
