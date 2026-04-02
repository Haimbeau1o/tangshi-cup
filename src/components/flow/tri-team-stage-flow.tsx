import { MatchControlCard } from "@/components/flow/match-control-card";
import { StandingsPanel } from "@/components/flow/standings-panel";
import type { TournamentFlow, TournamentMatchScore } from "@/lib/types";

type TriTeamStageFlowProps = {
  flow: TournamentFlow;
  editable?: boolean;
  onScoreSelect?: (matchId: string, score: TournamentMatchScore) => void;
  onClearMatch?: (matchId: string) => void;
};

export function TriTeamStageFlow({
  flow,
  editable = false,
  onScoreSelect,
  onClearMatch,
}: TriTeamStageFlowProps) {
  const roundRobinPhase = flow.phases[0];
  const finalPhase = flow.phases[1];

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-5">
        {roundRobinPhase.standings?.length ? <StandingsPanel standings={roundRobinPhase.standings} title={roundRobinPhase.title} /> : null}

        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Round Robin</p>
              <h3 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">{roundRobinPhase.title}</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-300">
              {roundRobinPhase.matches.length} 场
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-stone-400">{roundRobinPhase.description}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {roundRobinPhase.matches.map((match) => (
              <MatchControlCard
                key={match.id}
                match={match}
                editable={editable}
                onScoreSelect={onScoreSelect}
                onClearMatch={onClearMatch}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Final Gate</p>
          <h3 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">{finalPhase.title}</h3>
          <p className="mt-3 text-sm leading-7 text-stone-400">{finalPhase.description}</p>
          {roundRobinPhase.advancement?.length ? (
            <div className="mt-5 space-y-2">
              {roundRobinPhase.advancement.map((item) => (
                <div key={item} className="rounded-2xl border border-emerald-400/15 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-100">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
          {finalPhase.eliminated?.length ? (
            <div className="mt-3 space-y-2">
              {finalPhase.eliminated.map((item) => (
                <div key={item} className="rounded-2xl border border-rose-400/18 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {finalPhase.matches.map((match) => (
          <MatchControlCard
            key={match.id}
            match={match}
            editable={editable}
            onScoreSelect={onScoreSelect}
            onClearMatch={onClearMatch}
          />
        ))}
      </div>
    </div>
  );
}
