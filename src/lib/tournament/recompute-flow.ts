import type {
  TournamentFlow,
  TournamentMatch,
  TournamentMatchSlot,
} from "@/lib/types";
import { computeStandings } from "@/lib/tournament/compute-standings";

function cloneFlow(flow: TournamentFlow): TournamentFlow {
  return {
    ...flow,
    teams: flow.teams.map((team) => ({ ...team })),
    phases: flow.phases.map((phase) => ({
      ...phase,
      standings: phase.standings ? phase.standings.map((entry) => ({ ...entry })) : undefined,
      matches: phase.matches.map((match) => ({
        ...match,
        slots: match.slots.map((slot) => ({ ...slot })) as [TournamentMatchSlot, TournamentMatchSlot],
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

function getTeam(flow: TournamentFlow, teamId?: string) {
  return flow.teams.find((team) => team.id === teamId);
}

function getLoserTeamId(match: TournamentMatch) {
  if (!match.result) {
    return undefined;
  }

  const [leftSlot, rightSlot] = match.slots;

  if (!leftSlot.teamId || !rightSlot.teamId) {
    return undefined;
  }

  return match.result.winnerTeamId === leftSlot.teamId ? rightSlot.teamId : leftSlot.teamId;
}

function validateMatchResult(match: TournamentMatch) {
  const winsNeeded = match.bestOf === "bo1" ? 1 : match.bestOf === "bo3" ? 2 : 3;
  const hasLiveScore = match.score.left > 0 || match.score.right > 0;

  if (!match.result && !hasLiveScore) {
    match.status = "pending";
    return;
  }

  const [leftSlot, rightSlot] = match.slots;

  if (!leftSlot.teamId || !rightSlot.teamId) {
    match.score = { left: 0, right: 0 };
    match.result = undefined;
    match.status = "pending";
    return;
  }

  const completed = match.score.left >= winsNeeded || match.score.right >= winsNeeded;
  const tied = match.score.left === match.score.right;

  if (!completed) {
    match.result = undefined;
    match.status = hasLiveScore ? "live" : "pending";
    return;
  }

  if (tied) {
    match.result = undefined;
    match.status = "live";
    return;
  }

  match.result = {
    winnerTeamId: match.score.left > match.score.right ? leftSlot.teamId : rightSlot.teamId,
    score: { ...match.score },
  };
  match.status = "completed";
}

function applyTeamToSlot(flow: TournamentFlow, slot: TournamentMatchSlot, teamId?: string) {
  if (!teamId) {
    return {
      ...slot,
      teamId: undefined,
      avatarSrc: undefined,
    };
  }

  const team = getTeam(flow, teamId);

  return {
    ...slot,
    teamId,
    label: team?.name ?? slot.label,
    avatarSrc: team?.avatarSrc,
  };
}

function updateDerivedSlots(flow: TournamentFlow, match: TournamentMatch) {
  let slotsChanged = false;

  const nextSlots = match.slots.map((slot) => {
    if (!slot.sourceMatchId && !slot.standingIndex) {
      return slot;
    }

    let nextTeamId = slot.teamId;

    if (slot.sourceMatchId && slot.sourceOutcome) {
      const sourceMatch = flow.phases.flatMap((phase) => phase.matches).find((item) => item.id === slot.sourceMatchId);
      nextTeamId =
        slot.sourceOutcome === "winner" ? sourceMatch?.result?.winnerTeamId : getLoserTeamId(sourceMatch as TournamentMatch);
    }

    const nextSlot = applyTeamToSlot(flow, slot, nextTeamId);

    if (nextSlot.teamId !== slot.teamId) {
      slotsChanged = true;
    }

    return nextSlot;
  }) as [TournamentMatchSlot, TournamentMatchSlot];

  match.slots = nextSlots;

  if (slotsChanged) {
    match.score = { left: 0, right: 0 };
    match.result = undefined;
    match.status = "pending";
  }
}

function recomputeTriStage(flow: TournamentFlow) {
  const roundRobinPhase = flow.phases[0];
  const finalPhase = flow.phases[1];

  roundRobinPhase.matches.forEach((match) => {
    validateMatchResult(match);
  });

  const standings = computeStandings({
    teams: flow.teams,
    matches: roundRobinPhase.matches,
    advancingCount: 2,
  });

  roundRobinPhase.standings = standings;

  const standingsLocked = roundRobinPhase.matches.every((match) => match.result);
  const finalMatch = finalPhase.matches[0];

  if (standingsLocked) {
    const previousSlots = finalMatch.slots;
    finalMatch.slots = finalMatch.slots.map((slot) => {
      if (!slot.standingIndex) {
        return slot;
      }

      const entry = standings[slot.standingIndex - 1];
      return applyTeamToSlot(flow, slot, entry?.teamId);
    }) as [TournamentMatchSlot, TournamentMatchSlot];

    if (finalMatch.slots.some((slot, index) => slot.teamId !== previousSlots[index]?.teamId)) {
      finalMatch.score = { left: 0, right: 0 };
      finalMatch.result = undefined;
      finalMatch.status = "pending";
    }
  } else {
    finalMatch.slots = finalMatch.slots.map((slot) => ({
      ...slot,
      teamId: undefined,
      avatarSrc: undefined,
    })) as [TournamentMatchSlot, TournamentMatchSlot];
    finalMatch.score = { left: 0, right: 0 };
    finalMatch.result = undefined;
    finalMatch.status = "pending";
  }

  validateMatchResult(finalMatch);
  flow.championTeamId = finalMatch.result?.winnerTeamId;
}

function recomputeQuadBracket(flow: TournamentFlow) {
  const allMatches = flow.phases.flatMap((phase) => phase.matches);

  allMatches.forEach((match) => {
    updateDerivedSlots(flow, match);
    validateMatchResult(match);
  });

  const grandFinal = flow.phases[3].matches[0];
  flow.championTeamId = grandFinal.result?.winnerTeamId;
}

function recomputeSeries(flow: TournamentFlow) {
  const match = flow.phases[0].matches[0];
  validateMatchResult(match);
  flow.championTeamId = match.result?.winnerTeamId;
}

export function recomputeFlow(flow: TournamentFlow) {
  const nextFlow = cloneFlow(flow);

  if (nextFlow.layout === "tri-stage") {
    recomputeTriStage(nextFlow);
    return nextFlow;
  }

  if (nextFlow.layout === "quad-bracket") {
    recomputeQuadBracket(nextFlow);
    return nextFlow;
  }

  recomputeSeries(nextFlow);
  return nextFlow;
}
