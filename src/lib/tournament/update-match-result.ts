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
        history: match.history?.map((entry) => ({
          ...entry,
          score: { ...entry.score },
        })) ?? [],
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

function appendMatchHistory(match: TournamentFlow["phases"][number]["matches"][number], score: TournamentMatchScore) {
  const lastEntry = match.history?.at(-1);

  if (lastEntry && lastEntry.score.left === score.left && lastEntry.score.right === score.right) {
    return;
  }

  match.history = [
    ...(match.history ?? []),
    {
      id: `${match.id}-${Date.now()}-${score.left}-${score.right}`,
      score: { ...score },
      updatedAt: new Date().toISOString(),
    },
  ];
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
    appendMatchHistory(match, score);
    return recomputeFlow(nextFlow);
  }

  match.score = { ...score };
  appendMatchHistory(match, score);

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
  match.history = [];
  match.result = undefined;
  match.status = "pending";

  return recomputeFlow(nextFlow);
}
