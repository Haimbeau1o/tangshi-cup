import { TeamAvatar } from "@/components/ui/team-avatar";
import { cn } from "@/lib/utils";
import type { TournamentStandingsEntry } from "@/lib/types";

type StandingsPanelProps = {
  standings: TournamentStandingsEntry[];
  title?: string;
  className?: string;
};

export function StandingsPanel({
  standings,
  title = "积分榜",
  className,
}: StandingsPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Standings</p>
          <h3 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">{title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-300">
          {standings.length} 队
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {standings.map((entry) => (
          <div
            key={entry.teamId}
            className={cn(
              "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[24px] border px-4 py-3",
              entry.advanced
                ? "border-emerald-400/20 bg-emerald-400/8"
                : entry.eliminated
                  ? "border-rose-400/18 bg-rose-400/8"
                  : "border-white/8 bg-black/18",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl leading-none text-stone-50">{entry.rank}</span>
              <TeamAvatar src={entry.avatarSrc} alt={entry.name} accentColor={entry.advanced ? "#3adf7c" : "#4de3ff"} size="sm" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-100">{entry.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-stone-500">
                {entry.wins}-{entry.losses} 场 · 图差 {entry.mapDiff >= 0 ? `+${entry.mapDiff}` : entry.mapDiff}
              </p>
            </div>

            <div className="text-right">
              <p className="font-display text-3xl leading-none text-stone-50">{entry.points}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-stone-500">
                {entry.advanced ? "晋级" : entry.eliminated ? "淘汰" : "待定"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
