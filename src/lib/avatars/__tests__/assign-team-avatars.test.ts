import { describe, expect, it } from "vitest";

import { assignTeamAvatars } from "@/lib/avatars/assign-team-avatars";
import type { Team } from "@/lib/types";

function makeTeam(index: number): Team {
  return {
    id: `team-${index}`,
    name: `Team ${index}`,
    seed: index,
    players: [],
    totalPower: 20,
    averagePower: 4,
    coveredRoles: ["duelist", "initiator", "controller", "sentinel", "flex"],
  };
}

describe("assignTeamAvatars", () => {
  it("assigns unique avatars to each generated team", () => {
    const teams = assignTeamAvatars({
      teams: [makeTeam(1), makeTeam(2), makeTeam(3), makeTeam(4)],
      seed: "s2-opening-night",
    });

    expect(new Set(teams.map((team) => team.avatarId)).size).toBe(4);
    expect(teams.every((team) => team.avatarSrc)).toBe(true);
  });

  it("keeps avatar assignment stable for the same seed", () => {
    const first = assignTeamAvatars({
      teams: [makeTeam(1), makeTeam(2), makeTeam(3)],
      seed: "stable-seed",
    });
    const second = assignTeamAvatars({
      teams: [makeTeam(1), makeTeam(2), makeTeam(3)],
      seed: "stable-seed",
    });

    expect(second.map((team) => team.avatarId)).toEqual(first.map((team) => team.avatarId));
  });
});
