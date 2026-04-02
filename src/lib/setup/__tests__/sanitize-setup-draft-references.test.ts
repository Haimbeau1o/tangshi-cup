import { describe, expect, it } from "vitest";

import { getDefaultRuleModifiers } from "@/lib/content/defaults";
import { mockPlayers } from "@/lib/data/mock-players";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import { sanitizeSetupDraftReferences } from "@/lib/setup/sanitize-setup-draft-references";

describe("sanitizeSetupDraftReferences", () => {
  it("removes missing player and rule references from a setup draft", () => {
    const baseDraft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });
    const draft = {
      ...baseDraft,
      selectedPlayerIds: [mockPlayers[0].id, "missing-player", mockPlayers[1].id],
      captainIds: [mockPlayers[0].id, mockPlayers[2].id, "missing-player"],
      coachIds: [mockPlayers[3].id, "missing-coach"],
      ruleModifierIds: ["coach-call", "missing-rule"],
    };

    const sanitized = sanitizeSetupDraftReferences(
      draft,
      mockPlayers.slice(0, 4),
      getDefaultRuleModifiers().filter((modifier) => modifier.id !== "coach-call"),
    );

    expect(sanitized.selectedPlayerIds).toEqual([mockPlayers[0].id, mockPlayers[1].id]);
    expect(sanitized.captainIds).toEqual([mockPlayers[0].id]);
    expect(sanitized.coachIds).toEqual([mockPlayers[3].id]);
    expect(sanitized.ruleModifierIds).toEqual([]);
  });

  it("returns the same draft reference when nothing needs to be cleaned", () => {
    const ruleModifiers = getDefaultRuleModifiers();
    const draft = {
      ...createSetupDraft({
        templateId: "tri-finals",
        players: mockPlayers,
      }),
      captainIds: [mockPlayers[0].id],
      coachIds: [mockPlayers[18].id],
      ruleModifierIds: [ruleModifiers[0].id],
    };

    const sanitized = sanitizeSetupDraftReferences(draft, mockPlayers, ruleModifiers);

    expect(sanitized).toBe(draft);
  });
});
