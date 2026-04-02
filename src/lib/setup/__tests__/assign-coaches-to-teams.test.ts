import { describe, expect, it } from "vitest";

import { assignCoachesToTeams } from "@/lib/setup/assign-coaches-to-teams";
import type { Player, Team } from "@/lib/types";

function makeCoach(id: string, nickname: string): Player {
  return {
    id,
    slug: id,
    nickname,
    riotId: `${nickname}#CN`,
    mainRole: "flex",
    preferredAgents: ["Skye"],
    highestRank: "钻石",
    canCoach: true,
  };
}

function makeTeam(id: string, name: string): Team {
  return {
    id,
    name,
    players: [],
    totalPower: 35,
    averagePower: 7,
    coveredRoles: ["duelist", "initiator", "controller", "sentinel", "flex"],
  };
}

describe("assignCoachesToTeams", () => {
  it("assigns selected coaches to teams in order", () => {
    const teams = [
      makeTeam("team-1", "Crimson Echo"),
      makeTeam("team-2", "Cyan Protocol"),
      makeTeam("team-3", "Amber Reboot"),
    ];
    const coaches = [
      makeCoach("coach-1", "教练一号"),
      makeCoach("coach-2", "教练二号"),
      makeCoach("coach-3", "教练三号"),
    ];

    const updatedTeams = assignCoachesToTeams({
      teams,
      coachIds: coaches.map((coach) => coach.id),
      players: coaches,
    });

    expect(updatedTeams.map((team) => team.coachId)).toEqual(["coach-1", "coach-2", "coach-3"]);
  });

  it("ignores invalid coach ids and leaves extra teams without coaches", () => {
    const teams = [
      makeTeam("team-1", "Crimson Echo"),
      makeTeam("team-2", "Cyan Protocol"),
      makeTeam("team-3", "Amber Reboot"),
    ];
    const coaches = [makeCoach("coach-1", "教练一号")];

    const updatedTeams = assignCoachesToTeams({
      teams,
      coachIds: ["coach-1", "missing-coach"],
      players: coaches,
    });

    expect(updatedTeams.map((team) => team.coachId)).toEqual(["coach-1", undefined, undefined]);
  });
});
