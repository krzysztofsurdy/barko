"use client";

import { BellIcon, BellOffIcon } from "./icons";

interface NotificationToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function NotificationToggle({ enabled, onToggle }: NotificationToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={enabled ? "Notifications on" : "Notifications off"}
      className={`p-1.5 rounded-md transition-colors ${
        enabled
          ? "text-accent-orange hover:bg-sidebar-hover"
          : "text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover"
      }`}
    >
      {enabled ? <BellIcon size={14} /> : <BellOffIcon size={14} />}
    </button>
  );
}
