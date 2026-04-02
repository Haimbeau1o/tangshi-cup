import { describe, expect, it } from "vitest";

import { buildTournamentFlow } from "@/lib/setup/build-tournament-flow";
import type { Team } from "@/lib/types";

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

describe("buildTournamentFlow", () => {
  it("creates a series track for a two-team BO3", () => {
    const flow = buildTournamentFlow({
      teamCount: 2,
      bestOf: "bo1",
      formatId: "standard-bo3",
      teams: [makeTeam("team-1", "Crimson Echo"), makeTeam("team-2", "Cyan Protocol")],
    });

    expect(flow.layout).toBe("series");
    expect(flow.phases).toHaveLength(1);
    expect(flow.phases[0].matches).toHaveLength(1);
    expect(flow.phases[0].matches[0].bestOf).toBe("bo3");
    expect(flow.phases[0].matches[0].slots.map((slot) => slot.teamId)).toEqual(["team-1", "team-2"]);
  });

  it("creates a three-team staged flow with round robin then final using bo1 matches", () => {
    const flow = buildTournamentFlow({
      teamCount: 3,
      bestOf: "bo3",
      formatId: "tri-finals",
      teams: [
        makeTeam("team-1", "Crimson Echo"),
        makeTeam("team-2", "Cyan Protocol"),
        makeTeam("team-3", "Amber Reboot"),
      ],
    });

    expect(flow.layout).toBe("tri-stage");
    expect(flow.phases).toHaveLength(2);
    expect(flow.phases[0].title).toContain("循环");
    expect(flow.phases[0].matches).toHaveLength(3);
    expect(flow.phases[0].matches.every((match) => match.bestOf === "bo1")).toBe(true);
    expect(flow.phases[1].title).toContain("总决赛");
    expect(flow.phases[1].matches[0].bestOf).toBe("bo1");
    expect(flow.phases[1].matches[0].slots.map((slot) => slot.label)).toEqual(["积分第 1 名", "积分第 2 名"]);
    expect(flow.phases[1].eliminated).toEqual(["积分第 3 名淘汰"]);
  });

  it("creates a four-team double-track bracket using bo1 matches", () => {
    const flow = buildTournamentFlow({
      teamCount: 4,
      bestOf: "bo3",
      formatId: "dual-bracket-finals",
      teams: [
        makeTeam("team-1", "Crimson Echo"),
        makeTeam("team-2", "Cyan Protocol"),
        makeTeam("team-3", "Amber Reboot"),
        makeTeam("team-4", "Ghost Stack"),
      ],
    });

    expect(flow.layout).toBe("quad-bracket");
    expect(flow.phases).toHaveLength(4);
    expect(flow.phases[0].matches).toHaveLength(2);
    expect(flow.phases.flatMap((phase) => phase.matches).every((match) => match.bestOf === "bo1")).toBe(true);
    expect(flow.phases[1].matches).toHaveLength(2);
    expect(flow.phases[2].title).toContain("败者组");
    expect(flow.phases[3].title).toContain("总决赛");
  });
});
