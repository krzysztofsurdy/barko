"use client";

interface LiveIndicatorProps {
  active: boolean;
}

export function LiveIndicator({ active }: LiveIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-green-500 animate-pulse" : "bg-foreground/20"
        }`}
      />
      <span
        className={`text-xs font-semibold tracking-wider ${
          active ? "text-green-500" : "text-foreground/30"
        }`}
      >
        LIVE
      </span>
    </span>
  );
}
