import { describe, expect, it } from "vitest";

import { mockPlayers } from "@/lib/data/mock-players";
import { buildChronicleEntry } from "@/lib/chronicle/build-entry";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import type { PublishedSetup } from "@/lib/types";

function makePublishedSetup(): PublishedSetup {
  const draft = createSetupDraft({
    templateId: "tri-finals",
    players: mockPlayers,
  });

  return {
    ...draft,
    publishedAt: "2026-04-02T12:00:00.000Z",
    awards: {
      mvpPlayerId: mockPlayers[0].id,
      svpPlayerId: mockPlayers[1].id,
      votingNote: "请观众投票后再确认归档。",
    },
    generatedTeams: [
      {
        id: "team-1",
        name: "神罚俱乐部",
        players: mockPlayers.slice(0, 5),
        totalPower: 10,
        averagePower: 2,
        coveredRoles: ["duelist", "initiator", "controller", "sentinel", "flex"],
      },
    ],
    flow: {
      layout: "series",
      teams: [
        {
          id: "team-1",
          name: "神罚俱乐部",
          players: mockPlayers.slice(0, 5),
          totalPower: 10,
          averagePower: 2,
          coveredRoles: ["duelist", "initiator", "controller", "sentinel", "flex"],
        },
      ],
      phases: [],
      championTeamId: "team-1",
    },
  };
}

describe("buildChronicleEntry", () => {
  it("includes champion and awards in the synced chronicle entry", () => {
    const setup = makePublishedSetup();

    const entry = buildChronicleEntry({
      setup,
      players: mockPlayers,
    });

    expect(entry.championName).toBe("神罚俱乐部");
    expect(entry.mvpName).toBe(mockPlayers[0].nickname);
    expect(entry.svpName).toBe(mockPlayers[1].nickname);
    expect(entry.summary).toContain(mockPlayers[0].nickname);
    expect(entry.summary).toContain(mockPlayers[1].nickname);
  });
});
