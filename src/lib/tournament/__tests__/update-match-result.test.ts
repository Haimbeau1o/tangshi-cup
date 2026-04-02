import { describe, expect, it } from "vitest";

import { createMatchState } from "@/lib/tournament/create-match-state";
import { clearMatchResult, updateMatchResult } from "@/lib/tournament/update-match-result";
import type { Team } from "@/lib/types";

function makeTeam(index: number, name: string): Team {
  return {
    id: `team-${index}`,
    name,
    seed: index,
    players: [],
    totalPower: 20,
    averagePower: 4,
    coveredRoles: ["duelist", "initiator", "controller", "sentinel", "flex"],
  };
}

describe("updateMatchResult", () => {
  it("promotes the top two teams into the final in three-team mode", () => {
    const flow = createMatchState({
      teamCount: 3,
      bestOf: "bo3",
      teams: [makeTeam(1, "Crimson Echo"), makeTeam(2, "Cyan Protocol"), makeTeam(3, "Amber Reboot")],
    });

    const withMatchOne = updateMatchResult(flow, "rr-1", { left: 2, right: 1 });
    const withMatchTwo = updateMatchResult(withMatchOne, "rr-2", { left: 0, right: 2 });
    const complete = updateMatchResult(withMatchTwo, "rr-3", { left: 1, right: 2 });
    const finalMatch = complete.phases[1].matches[0];

    expect(finalMatch.slots[0].teamId).toBe("team-3");
    expect(finalMatch.slots[1].teamId).toBe("team-1");
  });

  it("fills downstream bracket slots after the opening four-team matches", () => {
    const flow = createMatchState({
      teamCount: 4,
      bestOf: "bo3",
      teams: [
        makeTeam(1, "Crimson Echo"),
        makeTeam(2, "Cyan Protocol"),
        makeTeam(3, "Amber Reboot"),
        makeTeam(4, "Ghost Stack"),
      ],
    });

    const withUpperOne = updateMatchResult(flow, "upper-1", { left: 2, right: 0 });
    const complete = updateMatchResult(withUpperOne, "upper-2", { left: 2, right: 1 });

    const winnersFinal = complete.phases[1].matches[0];
    const eliminationMatch = complete.phases[1].matches[1];

    expect(winnersFinal.slots.map((slot) => slot.teamId)).toEqual(["team-1", "team-2"]);
    expect(eliminationMatch.slots.map((slot) => slot.teamId)).toEqual(["team-4", "team-3"]);
  });

  it("clears dependent downstream results when an upstream match is changed", () => {
    const flow = createMatchState({
      teamCount: 4,
      bestOf: "bo3",
      teams: [
        makeTeam(1, "Crimson Echo"),
        makeTeam(2, "Cyan Protocol"),
        makeTeam(3, "Amber Reboot"),
        makeTeam(4, "Ghost Stack"),
      ],
    });

    const withUpperOne = updateMatchResult(flow, "upper-1", { left: 2, right: 0 });
    const withUpperTwo = updateMatchResult(withUpperOne, "upper-2", { left: 2, right: 1 });
    const withWinnersFinal = updateMatchResult(withUpperTwo, "winners-final", { left: 2, right: 1 });
    const withElimination = updateMatchResult(withWinnersFinal, "elimination-match", { left: 0, right: 2 });
    const withLowerFinal = updateMatchResult(withElimination, "lower-final", { left: 1, right: 2 });
    const revisedUpperOne = updateMatchResult(withLowerFinal, "upper-1", { left: 0, right: 2 });

    const winnersFinal = revisedUpperOne.phases[1].matches[0];
    const eliminationMatch = revisedUpperOne.phases[1].matches[1];
    const lowerFinal = revisedUpperOne.phases[2].matches[0];
    const grandFinal = revisedUpperOne.phases[3].matches[0];

    expect(winnersFinal.result).toBeUndefined();
    expect(winnersFinal.slots.map((slot) => slot.teamId)).toEqual(["team-4", "team-2"]);
    expect(eliminationMatch.result).toBeUndefined();
    expect(eliminationMatch.slots.map((slot) => slot.teamId)).toEqual(["team-1", "team-3"]);
    expect(lowerFinal.result).toBeUndefined();
    expect(grandFinal.result).toBeUndefined();
  });

  it("allows clearing a recorded result and removes the downstream path", () => {
    const flow = createMatchState({
      teamCount: 3,
      bestOf: "bo3",
      teams: [makeTeam(1, "Crimson Echo"), makeTeam(2, "Cyan Protocol"), makeTeam(3, "Amber Reboot")],
    });

    const withMatchOne = updateMatchResult(flow, "rr-1", { left: 2, right: 1 });
    const withMatchTwo = updateMatchResult(withMatchOne, "rr-2", { left: 0, right: 2 });
    const complete = updateMatchResult(withMatchTwo, "rr-3", { left: 1, right: 2 });
    const cleared = clearMatchResult(complete, "rr-3");
    const finalMatch = cleared.phases[1].matches[0];

    expect(finalMatch.slots[0].teamId).toBeUndefined();
    expect(finalMatch.slots[1].teamId).toBeUndefined();
  });

  it("keeps a series live while the score is still in progress", () => {
    const flow = createMatchState({
      teamCount: 2,
      bestOf: "bo3",
      teams: [makeTeam(1, "Crimson Echo"), makeTeam(2, "Cyan Protocol")],
    });

    const liveFlow = updateMatchResult(flow, "series-final", { left: 1, right: 0 });
    const seriesMatch = liveFlow.phases[0].matches[0];

    expect(seriesMatch.status).toBe("live");
    expect(seriesMatch.score).toEqual({ left: 1, right: 0 });
    expect(seriesMatch.result).toBeUndefined();
    expect(liveFlow.championTeamId).toBeUndefined();
  });

  it("only declares a winner once the series reaches the win threshold", () => {
    const flow = createMatchState({
      teamCount: 2,
      bestOf: "bo3",
      teams: [makeTeam(1, "Crimson Echo"), makeTeam(2, "Cyan Protocol")],
    });

    const tiedFlow = updateMatchResult(flow, "series-final", { left: 1, right: 1 });
    const liveSeries = tiedFlow.phases[0].matches[0];
    const completedFlow = updateMatchResult(tiedFlow, "series-final", { left: 2, right: 1 });
    const completedSeries = completedFlow.phases[0].matches[0];

    expect(liveSeries.status).toBe("live");
    expect(liveSeries.result).toBeUndefined();
    expect(completedSeries.status).toBe("completed");
    expect(completedSeries.result?.winnerTeamId).toBe("team-1");
    expect(completedFlow.championTeamId).toBe("team-1");
  });

  it("records score history while a series progresses", () => {
    const flow = createMatchState({
      teamCount: 2,
      bestOf: "bo3",
      teams: [makeTeam(1, "Crimson Echo"), makeTeam(2, "Cyan Protocol")],
    });

    const firstUpdate = updateMatchResult(flow, "series-final", { left: 1, right: 0 });
    const secondUpdate = updateMatchResult(firstUpdate, "series-final", { left: 2, right: 1 });
    const seriesMatch = secondUpdate.phases[0].matches[0];

    expect(seriesMatch.history).toHaveLength(2);
    expect(seriesMatch.history?.map((entry) => entry.score)).toEqual([
      { left: 1, right: 0 },
      { left: 2, right: 1 },
    ]);
  });

  it("clears stale downstream history when an upstream bracket result changes", () => {
    const flow = createMatchState({
      teamCount: 4,
      bestOf: "bo3",
      teams: [
        makeTeam(1, "Crimson Echo"),
        makeTeam(2, "Cyan Protocol"),
        makeTeam(3, "Amber Reboot"),
        makeTeam(4, "Ghost Stack"),
      ],
    });

    const withUpperOne = updateMatchResult(flow, "upper-1", { left: 2, right: 0 });
    const withUpperTwo = updateMatchResult(withUpperOne, "upper-2", { left: 2, right: 1 });
    const withWinnersFinal = updateMatchResult(withUpperTwo, "winners-final", { left: 2, right: 1 });
    const revisedUpperOne = updateMatchResult(withWinnersFinal, "upper-1", { left: 0, right: 2 });

    const winnersFinal = revisedUpperOne.phases[1].matches[0];

    expect(winnersFinal.history ?? []).toEqual([]);
  });

  it("resets a live series back to 0:0 when cleared", () => {
    const flow = createMatchState({
      teamCount: 2,
      bestOf: "bo3",
      teams: [makeTeam(1, "Crimson Echo"), makeTeam(2, "Cyan Protocol")],
    });

    const liveFlow = updateMatchResult(flow, "series-final", { left: 1, right: 0 });
    const clearedFlow = clearMatchResult(liveFlow, "series-final");
    const seriesMatch = clearedFlow.phases[0].matches[0];

    expect(seriesMatch.status).toBe("pending");
    expect(seriesMatch.score).toEqual({ left: 0, right: 0 });
    expect(seriesMatch.result).toBeUndefined();
  });
});
