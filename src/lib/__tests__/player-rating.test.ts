import { describe, expect, it } from "vitest";

import { calculatePlayerPower } from "@/lib/player-rating";
import type { Player } from "@/lib/types";

function makePlayer(highestRank: Player["highestRank"]): Player {
  return {
    id: "test-player",
    slug: "test-player",
    nickname: "Test Player",
    riotId: "Tester#CN",
    mainRole: "duelist",
    preferredAgents: ["Jett"],
    highestRank,
  };
}

describe("calculatePlayerPower", () => {
  it("maps a player's highest rank to the configured balance score", () => {
    expect(calculatePlayerPower(makePlayer("黑铁"))).toBe(1);
    expect(calculatePlayerPower(makePlayer("铂金"))).toBe(5);
    expect(calculatePlayerPower(makePlayer("赋能"))).toBe(9);
  });

  it("keeps rank scoring stable and integer-based for balancing", () => {
    const power = calculatePlayerPower(makePlayer("超凡"));

    expect(power).toBe(7);
    expect(Number.isInteger(power)).toBe(true);
  });
});
