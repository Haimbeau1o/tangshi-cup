import { MatchControlCard } from "@/components/flow/match-control-card";
import type { TournamentFlow, TournamentMatchScore } from "@/lib/types";

type FourTeamBracketProps = {
  flow: TournamentFlow;
  editable?: boolean;
  onScoreSelect?: (matchId: string, score: TournamentMatchScore) => void;
  onClearMatch?: (matchId: string) => void;
};

export function FourTeamBracket({
  flow,
  editable = false,
  onScoreSelect,
  onClearMatch,
}: FourTeamBracketProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-4">
      {flow.phases.map((phase, index) => (
        <div key={phase.id} className="relative space-y-4">
          <div className="absolute left-5 top-0 h-full w-px bg-[linear-gradient(180deg,rgba(77,227,255,0.4),transparent_75%)] xl:block hidden" />
          <div className="relative rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Stage {index + 1}</p>
                <h3 className="mt-2 font-display text-3xl uppercase tracking-[0.08em] text-stone-50">{phase.title}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-300">
                {phase.matches.length} 场
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-stone-400">{phase.description}</p>
          </div>

          <div className="space-y-4">
            {phase.matches.map((match) => (
              <MatchControlCard
                key={match.id}
                match={match}
                editable={editable}
                onScoreSelect={onScoreSelect}
                onClearMatch={onClearMatch}
              />
            ))}
          </div>

          {phase.eliminated?.length ? (
            <div className="rounded-[24px] border border-rose-400/18 bg-rose-400/8 px-4 py-4 text-sm text-rose-100">
              {phase.eliminated.join(" / ")}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
