import { describe, expect, it } from "vitest";

import { buildTournamentFlow } from "@/lib/setup/build-tournament-flow";
import { buildFlowBoardLayout } from "@/lib/flow-board/build-flow-board-layout";
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

describe("buildFlowBoardLayout", () => {
  it("creates a staged board for three-team flow with standings feeding the final", () => {
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

    const layout = buildFlowBoardLayout(flow);
    const standingsNode = layout.nodes.find((node) => node.kind === "standings");
    const finalNode = layout.nodes.find((node) => node.matchId === "final");
    const rrNodes = layout.nodes.filter((node) => node.matchId?.startsWith("rr-"));

    expect(layout.width).toBeGreaterThan(1200);
    expect(layout.height).toBeGreaterThan(800);
    expect(layout.lanes.map((lane) => lane.phaseId)).toEqual(["round-robin", "grand-final"]);
    expect(standingsNode).toBeDefined();
    expect(rrNodes).toHaveLength(3);
    expect(finalNode).toBeDefined();
    expect(standingsNode!.x).toBeLessThan(finalNode!.x);
    expect(layout.edges.some((edge) => edge.fromNodeId === standingsNode!.id && edge.toNodeId === finalNode!.id)).toBe(true);
  });

  it("creates winner and loser edges for a four-team bracket board", () => {
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

    const layout = buildFlowBoardLayout(flow);
    const winnersFinalNode = layout.nodes.find((node) => node.matchId === "winners-final");
    const eliminationNode = layout.nodes.find((node) => node.matchId === "elimination-match");
    const grandFinalNode = layout.nodes.find((node) => node.matchId === "grand-final");
    const winnerEdges = layout.edges.filter((edge) => edge.kind === "winner");
    const loserEdges = layout.edges.filter((edge) => edge.kind === "loser");

    expect(layout.lanes).toHaveLength(4);
    expect(layout.nodes.filter((node) => node.kind === "match")).toHaveLength(6);
    expect(layout.width).toBeGreaterThan(1800);
    expect(layout.height).toBeGreaterThan(900);
    expect(winnersFinalNode).toBeDefined();
    expect(eliminationNode).toBeDefined();
    expect(grandFinalNode).toBeDefined();
    expect(winnerEdges.some((edge) => edge.toNodeId === winnersFinalNode!.id)).toBe(true);
    expect(loserEdges.some((edge) => edge.toNodeId === eliminationNode!.id)).toBe(true);
    expect(winnerEdges.some((edge) => edge.toNodeId === grandFinalNode!.id)).toBe(true);
  });
});
