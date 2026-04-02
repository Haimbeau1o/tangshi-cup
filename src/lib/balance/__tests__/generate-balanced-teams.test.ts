import { describe, expect, it } from "vitest";

import { generateBalancedTeams } from "@/lib/balance/generate-balanced-teams";
import type { Player, PlayerRole } from "@/lib/types";

const roles: PlayerRole[] = ["duelist", "initiator", "controller", "sentinel", "flex"];
const rankOrder: Player["highestRank"][] = ["黑铁", "青铜", "白银", "黄金", "铂金", "钻石", "超凡", "深化", "赋能"];

function makePlayer(index: number, rankScore: number): Player {
  return {
    id: `player-${index}`,
    slug: `player-${index}`,
    nickname: `Player ${index}`,
    riotId: `Player${index}#CN`,
    mainRole: roles[(index - 1) % roles.length],
    preferredAgents: ["Jett"],
    highestRank: rankOrder[Math.max(0, Math.min(rankOrder.length - 1, rankScore - 1))],
  };
}

describe("generateBalancedTeams", () => {
  it("splits 10 players into two fair teams of five", () => {
    const players = [9, 8, 7, 6, 5, 4, 3, 2, 1, 1].map((rankScore, index) =>
      makePlayer(index + 1, rankScore),
    );

    const result = generateBalancedTeams({ players, teamCount: 2, teamSize: 5 });

    expect(result.teams).toHaveLength(2);
    expect(result.teams.every((team) => team.players.length === 5)).toBe(true);
    expect(new Set(result.teams.flatMap((team) => team.players.map((player) => player.id))).size).toBe(10);
    expect(result.balanceGapPercent).toBeLessThanOrEqual(0.1);
    expect(result.qualityBand).toBe("green");
  });

  it("keeps a three-team night tightly clustered by total power", () => {
    const rankScores = [9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 2, 1];
    const players = rankScores.map((rankScore, index) => makePlayer(index + 1, rankScore));

    const result = generateBalancedTeams({ players, teamCount: 3, teamSize: 5 });

    expect(result.teams).toHaveLength(3);
    expect(result.teams.every((team) => team.players.length === 5)).toBe(true);
    expect(result.powerSpread).toBeLessThanOrEqual(1);
    expect(result.qualityBand).toBe("green");
  });

  it("spreads locked captains so each team gets one", () => {
    const rankScores = [9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 2, 1];
    const players = rankScores.map((rankScore, index) => makePlayer(index + 1, rankScore));
    const captainIds = [players[0].id, players[1].id, players[2].id];

    const result = generateBalancedTeams({
      players,
      teamCount: 3,
      teamSize: 5,
      captainIds,
    });

    expect(result.teams).toHaveLength(3);
    expect(result.teams.every((team) => team.captainId)).toBe(true);
    expect(new Set(result.teams.map((team) => team.captainId)).size).toBe(3);
  });
});
