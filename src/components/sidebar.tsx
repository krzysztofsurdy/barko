"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  ProcessIcon,
  TeamsIcon,
  TasksIcon,
  SkillsIcon,
  ConfigIcon,
  LogsIcon,
  HistoryIcon,
} from "./icons";
import { type ComponentType, type SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const navItems: { href: string; label: string; Icon: IconComponent }[] = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon },
  { href: "/processes", label: "Processes", Icon: ProcessIcon },
  { href: "/teams", label: "Teams", Icon: TeamsIcon },
  { href: "/tasks", label: "Tasks", Icon: TasksIcon },
  { href: "/skills", label: "Skills", Icon: SkillsIcon },
  { href: "/config", label: "Config", Icon: ConfigIcon },
  { href: "/logs", label: "Logs", Icon: LogsIcon },
  { href: "/history", label: "History", Icon: HistoryIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar-bg text-sidebar-text flex flex-col z-10">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight">
          AI Agent Monitor
        </h1>
        <p className="text-xs text-white/40 mt-0.5">Local Activity Dashboard</p>
      </div>
      <nav className="flex-1 py-3">
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
                  ? "bg-sidebar-active/20 text-white border-r-2 border-sidebar-active"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.Icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-xs text-white/30">
        v0.1.0
      </div>
    </aside>
  );
}
