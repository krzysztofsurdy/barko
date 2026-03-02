import Link from "next/link";
import { CopyableId } from "./copyable-id";

interface TeamMember {
  name: string;
  agentType: string;
  color?: string;
}

interface TeamCardProps {
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: number;
}

const colorMap: Record<string, string> = {
  blue: "bg-accent-teal",
  red: "bg-accent-pink",
  green: "bg-accent-green",
  yellow: "bg-accent-yellow",
  purple: "bg-accent-purple",
  orange: "bg-accent-orange",
  pink: "bg-accent-pink",
  cyan: "bg-accent-teal",
};

function MemberAvatar({ name, color }: { name: string; color?: string }) {
  const bg = colorMap[color || ""] || "bg-slate-500";
  const initials = name
    .split("-")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${bg} w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold`}
      title={name}
    >
      {initials}
    </div>
  );
}

export function TeamCard({
  name,
  description,
  members,
  createdAt,
}: TeamCardProps) {
  return (
    <Link
      href={`/teams/${encodeURIComponent(name)}`}
      className="block rounded-lg border border-card-border bg-card-bg p-4 hover:border-sidebar-active/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{name}</h3>
          <CopyableId value={name} className="text-foreground/40" />
        </div>
        <span className="text-xs text-foreground/40">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </span>
      </div>
      {description && (
        <p className="text-sm text-foreground/60 mb-3 line-clamp-2">
          {description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {members.slice(0, 5).map((m) => (
            <MemberAvatar key={m.name} name={m.name} color={m.color} />
          ))}
          {members.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold">
              +{members.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-foreground/40">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
