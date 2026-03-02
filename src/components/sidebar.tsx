"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  ProcessIcon,
  TeamsIcon,
  ConversationIcon,
  TasksIcon,
  SkillsIcon,
  AgentsIcon,
  ConfigIcon,
  LogsIcon,
  HistoryIcon,
  SearchIcon,
  CostIcon,
  TimelineIcon,
  LiveIcon,
} from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { NotificationToggle } from "./notification-toggle";
import { useNotifications } from "@/lib/use-notifications";
import { type ComponentType, type SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const navItems: { href: string; label: string; Icon: IconComponent; activeColor: string }[] = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon, activeColor: "text-accent-teal" },
  { href: "/live", label: "Live", Icon: LiveIcon, activeColor: "text-accent-green" },
  { href: "/processes", label: "Processes", Icon: ProcessIcon, activeColor: "text-accent-green" },
  { href: "/teams", label: "Teams", Icon: TeamsIcon, activeColor: "text-accent-teal" },
  { href: "/conversations", label: "Conversations", Icon: ConversationIcon, activeColor: "text-accent-purple" },
  { href: "/tasks", label: "Tasks", Icon: TasksIcon, activeColor: "text-accent-orange" },
  { href: "/skills", label: "Skills", Icon: SkillsIcon, activeColor: "text-accent-purple" },
  { href: "/agents", label: "Agents", Icon: AgentsIcon, activeColor: "text-accent-teal" },
  { href: "/search", label: "Search", Icon: SearchIcon, activeColor: "text-accent-yellow" },
  { href: "/costs", label: "Costs", Icon: CostIcon, activeColor: "text-accent-orange" },
  { href: "/timeline", label: "Timeline", Icon: TimelineIcon, activeColor: "text-accent-pink" },
  { href: "/config", label: "Config", Icon: ConfigIcon, activeColor: "text-accent-teal" },
  { href: "/logs", label: "Logs", Icon: LogsIcon, activeColor: "text-accent-green" },
  { href: "/history", label: "History", Icon: HistoryIcon, activeColor: "text-accent-purple" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { enabled, toggle } = useNotifications();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar-bg text-sidebar-text border-r border-sidebar-border flex flex-col z-10">
      <div className="px-5 py-5 border-b border-sidebar-border flex justify-center">
        <img src="/logo.png" alt="Barko" height={144} className="h-36 w-auto" />
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? `bg-sidebar-hover/50 ${item.activeColor} border-r-2`
                  : "text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover"
              }`}
              style={isActive ? { borderColor: "currentColor" } : undefined}
            >
              <item.Icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-sidebar-border flex items-center justify-between">
        <span className="text-xs text-sidebar-muted">v0.3.0</span>
        <div className="flex items-center gap-1">
          <NotificationToggle enabled={enabled} onToggle={toggle} />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
