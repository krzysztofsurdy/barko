"use client";

import { useTheme } from "./theme-provider";
import { SunIcon, MonitorIcon, MoonIcon } from "./icons";

const options = [
  { value: "light" as const, label: "Light", Icon: SunIcon },
  { value: "system" as const, label: "System", Icon: MonitorIcon },
  { value: "dark" as const, label: "Dark", Icon: MoonIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-lg bg-sidebar-hover p-0.5">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
            theme === value
              ? "bg-sidebar-active text-white"
              : "text-sidebar-muted hover:text-sidebar-text"
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
