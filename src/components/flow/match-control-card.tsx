"use client";

import { TeamAvatar } from "@/components/ui/team-avatar";
import { cn } from "@/lib/utils";
import type { TournamentMatch, TournamentMatchScore } from "@/lib/types";

type MatchControlCardProps = {
  match: TournamentMatch;
  editable?: boolean;
  onScoreSelect?: (matchId: string, score: TournamentMatchScore) => void;
  onClearMatch?: (matchId: string) => void;
  className?: string;
};

function getWinsNeeded(match: TournamentMatch) {
  if (match.bestOf === "bo1") {
    return 1;
  }

  if (match.bestOf === "bo5") {
    return 3;
  }

  return 2;
}

function getStatusLabel(match: TournamentMatch) {
  if (match.status === "completed") {
    return "已完成";
  }

  if (match.status === "live") {
    return "进行中";
  }

  if (match.slots.every((slot) => slot.teamId)) {
    return "待录入";
  }

  return "等待上游";
}

function getTeamScore(match: TournamentMatch, slotIndex: 0 | 1) {
  if (match.score.left === 0 && match.score.right === 0) {
    return "--";
  }

  return slotIndex === 0 ? String(match.score.left) : String(match.score.right);
}

export function MatchControlCard({
  match,
  editable = false,
  onScoreSelect,
  onClearMatch,
  className,
}: MatchControlCardProps) {
  const matchReady = match.slots.every((slot) => slot.teamId);
  const statusLabel = getStatusLabel(match);
  const winsNeeded = getWinsNeeded(match);
  const maxMaps = winsNeeded * 2 - 1;

  function buildNextScore(side: "left" | "right", delta: 1 | -1) {
    const nextScore = {
      ...match.score,
      [side]: Math.max(0, Math.min(winsNeeded, match.score[side] + delta)),
    };

    if (nextScore.left + nextScore.right > maxMaps) {
      return match.score;
    }

    return nextScore;
  }

  return (
    <div
      data-flow-node="true"
      className={cn(
        "rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">{match.label}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">{match.bestOf.toUpperCase()}</p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]",
            match.status === "completed"
              ? "border-emerald-400/25 bg-emerald-400/12 text-emerald-200"
              : match.status === "live"
                ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                : matchReady
                ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                : "border-white/10 bg-white/6 text-stone-400",
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {match.slots.map((slot, index) => {
          const isWinner = match.result?.winnerTeamId && slot.teamId === match.result.winnerTeamId;

          return (
            <div
              key={`${match.id}-${slot.label}-${index}`}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[22px] border px-3 py-3 transition",
                isWinner
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : "border-white/8 bg-black/22",
              )}
            >
              <TeamAvatar
                src={slot.avatarSrc}
                alt={slot.teamId ?? slot.label}
                accentColor={isWinner ? "#3adf7c" : "#ff7a45"}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-100">{slot.teamId ? slot.label : slot.label}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-stone-500">
                  {slot.teamId ? (isWinner ? "胜者" : "参赛队") : "待定席位"}
                </p>
              </div>
              <div className="min-w-10 text-right font-display text-3xl leading-none text-stone-50">
                {getTeamScore(match, index as 0 | 1)}
              </div>
            </div>
          );
        })}
      </div>

      {match.note ? <p className="mt-3 text-sm leading-6 text-stone-400">{match.note}</p> : null}

      {editable ? (
        <div className="mt-4 space-y-3">
          {matchReady ? (
            <div className="flex flex-wrap gap-2">
              {([
                { label: "左侧 +1", score: buildNextScore("left", 1) },
                { label: "左侧 -1", score: buildNextScore("left", -1) },
                { label: "右侧 +1", score: buildNextScore("right", 1) },
                { label: "右侧 -1", score: buildNextScore("right", -1) },
              ] as const).map((option) => (
                <button
                  key={`${match.id}-${option.label}`}
                  type="button"
                  onClick={() => onScoreSelect?.(match.id, option.score)}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-stone-100 transition hover:bg-white/10"
                >
                  {option.label}
                </button>
              ))}
              {match.score.left > 0 || match.score.right > 0 ? (
                <button
                  type="button"
                  onClick={() => onClearMatch?.(match.id)}
                  className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/16"
                >
                  清空结果
                </button>
              ) : null}
            </div>
          ) : (
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">等待上一场确定晋级/淘汰结果后，这一场会自动落位。</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
