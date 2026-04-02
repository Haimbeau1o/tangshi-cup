import { MatchControlCard } from "@/components/flow/match-control-card";
import type { TournamentFlow, TournamentMatchScore } from "@/lib/types";

type SeriesTrackProps = {
  flow: TournamentFlow;
  editable?: boolean;
  onScoreSelect?: (matchId: string, score: TournamentMatchScore) => void;
  onClearMatch?: (matchId: string) => void;
};

export function SeriesTrack({ flow, editable = false, onScoreSelect, onClearMatch }: SeriesTrackProps) {
  const phase = flow.phases[0];
  const match = phase.matches[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[0.58fr_1.42fr]">
      <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Series Board</p>
        <h3 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">{phase.title}</h3>
        <p className="mt-3 text-sm leading-7 text-stone-400">{phase.description}</p>
        {phase.advancement?.length ? (
          <div className="mt-5 space-y-2">
            {phase.advancement.map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-black/18 px-4 py-3 text-sm text-stone-300">
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <MatchControlCard match={match} editable={editable} onScoreSelect={onScoreSelect} onClearMatch={onClearMatch} />
    </div>
  );
}
