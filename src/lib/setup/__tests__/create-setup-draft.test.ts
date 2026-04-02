import { describe, expect, it } from "vitest";

import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import { mockPlayers } from "@/lib/data/mock-players";
import type { PublishedSetup } from "@/lib/types";

function makePublishedSetup(label: string, slug: string): PublishedSetup {
  return {
    id: `setup-${slug}`,
    templateId: "tri-finals",
    currentStep: 6,
    season: {
      slug,
      label,
      cupName: "唐氏杯",
      name: "三强试炼",
      theme: "主题",
      tagline: "口号",
    },
    event: {
      slug: `${slug}-tri-finals`,
      title: `唐氏杯 ${label} 三强试炼`,
      teamCount: 3,
      teamSize: 5,
      bestOf: "bo1",
      tone: "balanced",
      timeBudgetMinutes: 120,
      formatId: "tri-finals",
    },
    selectedPlayerIds: [],
    captainIds: [],
    coachIds: [],
    ruleModifierIds: [],
    teamCustomizations: {},
    updatedAt: "2026-04-02T10:00:00.000Z",
    publishedAt: "2026-04-02T10:00:00.000Z",
  };
}

describe("createSetupDraft", () => {
  it("boots the three-team template with the recommended player count and format", () => {
    const draft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });

    expect(draft.season.label).toBe("S1");
    expect(draft.season.slug).toBe("s1");
    expect(draft.event.teamCount).toBe(3);
    expect(draft.event.bestOf).toBe("bo1");
    expect(draft.event.formatId).toBe("tri-finals");
    expect(draft.event.title).toBe("唐氏杯 S1 三强试炼");
    expect(draft.event.slug).toBe("s1-tri-finals");
    expect(draft.season.cupName).toBe("唐氏杯");
    expect(draft.selectedPlayerIds).toHaveLength(15);
    expect(draft.teamCustomizations).toEqual({});
    expect(draft.currentStep).toBe(1);
  });

  it("uses the highest saved season plus one from published setups", () => {
    const draft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
      publishedSetups: [makePublishedSetup("S2", "s2"), makePublishedSetup("S3", "s3")],
    });

    expect(draft.season.label).toBe("S4");
    expect(draft.season.slug).toBe("s4");
    expect(draft.event.title).toBe("唐氏杯 S4 三强试炼");
    expect(draft.event.slug).toBe("s4-tri-finals");
  });

  it("boots the four-team carnival template with all 20 players selected", () => {
    const draft = createSetupDraft({
      templateId: "four-team-carnival",
      players: mockPlayers,
    });

    expect(draft.event.teamCount).toBe(4);
    expect(draft.event.bestOf).toBe("bo1");
    expect(draft.event.tone).toBe("fun");
    expect(draft.selectedPlayerIds).toHaveLength(20);
    expect(draft.ruleModifierIds.length).toBeGreaterThan(0);
  });

  it("keeps two-team template fixed on bo3", () => {
    const draft = createSetupDraft({
      templateId: "two-team-standard",
      players: mockPlayers,
    });

    expect(draft.event.teamCount).toBe(2);
    expect(draft.event.bestOf).toBe("bo3");
  });
});
