import { describe, expect, it } from "vitest";

import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import { mockPlayers } from "@/lib/data/mock-players";

describe("createSetupDraft", () => {
  it("boots the three-team template with the recommended player count and format", () => {
    const draft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });

    expect(draft.season.label).toBe("S2");
    expect(draft.event.teamCount).toBe(3);
    expect(draft.event.bestOf).toBe("bo1");
    expect(draft.event.formatId).toBe("tri-finals");
    expect(draft.season.cupName).toBe("唐氏杯");
    expect(draft.selectedPlayerIds).toHaveLength(15);
    expect(draft.teamCustomizations).toEqual({});
    expect(draft.currentStep).toBe(1);
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
