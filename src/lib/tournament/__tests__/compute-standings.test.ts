import { describe, expect, it } from "vitest";

import { computeStandings } from "@/lib/tournament/compute-standings";
import type { Team, TournamentMatch } from "@/lib/types";

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

function makeMatch(
  id: string,
  leftTeamId: string,
  rightTeamId: string,
  scoreLeft: number,
  scoreRight: number,
  winnerTeamId: string,
): TournamentMatch {
  return {
    id,
    label: id,
    bestOf: "bo3",
    status: "completed",
    kind: "round-robin",
    slots: [
      { teamId: leftTeamId, label: leftTeamId },
      { teamId: rightTeamId, label: rightTeamId },
    ],
    score: {
      left: scoreLeft,
      right: scoreRight,
    },
    result: {
      winnerTeamId,
      score: {
        left: scoreLeft,
        right: scoreRight,
      },
    },
  };
}

describe("computeStandings", () => {
  it("sorts teams by match wins and map differential for a three-team round robin", () => {
    const teams = [makeTeam(1, "Crimson Echo"), makeTeam(2, "Cyan Protocol"), makeTeam(3, "Amber Reboot")];
    const matches = [
      makeMatch("rr-1", "team-1", "team-2", 2, 1, "team-1"),
      makeMatch("rr-2", "team-2", "team-3", 0, 2, "team-3"),
      makeMatch("rr-3", "team-1", "team-3", 1, 2, "team-3"),
    ];

    const standings = computeStandings({
      teams,
      matches,
      advancingCount: 2,
    });

    expect(standings.map((entry) => entry.teamId)).toEqual(["team-3", "team-1", "team-2"]);
    expect(standings[0]).toMatchObject({ wins: 2, losses: 0, advanced: true });
    expect(standings[1]).toMatchObject({ wins: 1, losses: 1, advanced: true });
    expect(standings[2]).toMatchObject({ wins: 0, losses: 2, eliminated: true });
  });
});
