import { rankScoreMap } from "@/lib/player-rating";
import type { RankTier } from "@/lib/types";
import { cn } from "@/lib/utils";

const rankToneMap: Record<RankTier, string> = {
  黑铁: "border-stone-500/25 bg-stone-500/15 text-stone-100",
  青铜: "border-amber-800/40 bg-amber-700/20 text-amber-100",
  白银: "border-slate-400/30 bg-slate-300/15 text-slate-100",
  黄金: "border-yellow-400/35 bg-yellow-400/20 text-yellow-100",
  铂金: "border-emerald-400/35 bg-emerald-400/16 text-emerald-100",
  钻石: "border-sky-400/35 bg-sky-400/18 text-sky-100",
  超凡: "border-fuchsia-400/35 bg-fuchsia-400/16 text-fuchsia-100",
  深化: "border-indigo-400/35 bg-indigo-400/18 text-indigo-100",
  赋能: "border-rose-400/40 bg-rose-400/18 text-rose-100",
};

type RankChipProps = {
  rank: RankTier;
  className?: string;
  showScore?: boolean;
};

export function RankChip({ rank, className, showScore = false }: RankChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.2em]",
        rankToneMap[rank],
        className,
      )}
    >
      <span>{rank}</span>
      {showScore ? <span className="text-[10px] opacity-75">P{rankScoreMap[rank]}</span> : null}
    </span>
  );
}
