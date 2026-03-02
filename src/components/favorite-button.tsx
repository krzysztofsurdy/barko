"use client";

import { StarIcon, StarFilledIcon } from "./icons";

interface FavoriteButtonProps {
  active: boolean;
  onClick: () => void;
}

export function FavoriteButton({ active, onClick }: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`transition-all duration-150 hover:scale-110 active:scale-95 ${
        active ? "text-yellow-400" : "text-foreground/20 hover:text-foreground/40"
      }`}
      title={active ? "Remove bookmark" : "Add bookmark"}
    >
      {active ? <StarFilledIcon size={14} /> : <StarIcon size={14} />}
    </button>
  );
}
