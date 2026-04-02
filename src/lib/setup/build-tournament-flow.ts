import { createMatchState } from "@/lib/tournament/create-match-state";
import { resolveFixedBestOf } from "@/lib/tournament/resolve-fixed-best-of";
import type { MatchSeriesType, Team, TournamentFlow } from "@/lib/types";

type BuildTournamentFlowInput = {
  teamCount: 2 | 3 | 4;
  bestOf: MatchSeriesType;
  formatId: string;
  teams: Team[];
};

export function buildTournamentFlow({
  teamCount,
  bestOf: _bestOf,
  formatId: _formatId,
  teams,
}: BuildTournamentFlowInput): TournamentFlow {
  const bestOf = resolveFixedBestOf(teamCount);

  void _bestOf;
  void _formatId;

  return createMatchState({
    teamCount,
    bestOf,
    teams,
  });
}
