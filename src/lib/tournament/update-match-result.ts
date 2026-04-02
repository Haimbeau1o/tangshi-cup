import type { TournamentFlow, TournamentMatchScore } from "@/lib/types";
import { recomputeFlow } from "@/lib/tournament/recompute-flow";

function cloneForUpdate(flow: TournamentFlow) {
  return {
    ...flow,
    teams: flow.teams.map((team) => ({ ...team })),
    phases: flow.phases.map((phase) => ({
      ...phase,
      standings: phase.standings ? phase.standings.map((entry) => ({ ...entry })) : undefined,
      matches: phase.matches.map((match) => ({
        ...match,
        slots: match.slots.map((slot) => ({ ...slot })) as typeof match.slots,
        score: { ...match.score },
        result: match.result
          ? {
              ...match.result,
              score: { ...match.result.score },
            }
          : undefined,
      })),
    })),
  };
}

export function updateMatchResult(flow: TournamentFlow, matchId: string, score: TournamentMatchScore) {
  const nextFlow = cloneForUpdate(flow);
  const match = nextFlow.phases.flatMap((phase) => phase.matches).find((item) => item.id === matchId);

  if (!match) {
    return nextFlow;
  }

  const [leftSlot, rightSlot] = match.slots;

  if (!leftSlot.teamId || !rightSlot.teamId || score.left === score.right) {
    match.score = { ...score };
    return recomputeFlow(nextFlow);
  }

  match.score = { ...score };

  return recomputeFlow(nextFlow);
}

export function clearMatchResult(flow: TournamentFlow, matchId: string) {
  const nextFlow = cloneForUpdate(flow);
  const match = nextFlow.phases.flatMap((phase) => phase.matches).find((item) => item.id === matchId);

  if (!match) {
    return nextFlow;
  }

  match.score = {
    left: 0,
    right: 0,
  };
  match.result = undefined;
  match.status = "pending";

  return recomputeFlow(nextFlow);
}
