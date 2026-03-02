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
    <div className="flex rounded-lg bg-white/5 p-0.5">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
            theme === value
              ? "bg-sidebar-active text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
