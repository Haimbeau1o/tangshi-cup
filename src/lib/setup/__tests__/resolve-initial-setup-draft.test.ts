import { describe, expect, it } from "vitest";

import { mockPlayers } from "@/lib/data/mock-players";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import { resolveInitialSetupDraft } from "@/lib/setup/resolve-initial-setup-draft";

describe("resolveInitialSetupDraft", () => {
  it("returns the saved draft when resume mode is enabled and a draft exists", () => {
    const storedDraft = createSetupDraft({
      templateId: "four-team-carnival",
      players: mockPlayers,
    });

    const draft = resolveInitialSetupDraft({
      requestedTemplateId: "two-team-standard",
      shouldResume: true,
      storedDraft,
      players: mockPlayers,
    });

    expect(draft.id).toBe(storedDraft.id);
    expect(draft.event.teamCount).toBe(4);
    expect(draft.templateId).toBe("four-team-carnival");
  });

  it("falls back to the three-team template when the requested template is invalid", () => {
    const draft = resolveInitialSetupDraft({
      requestedTemplateId: "unknown-template",
      shouldResume: false,
      storedDraft: null,
      players: mockPlayers,
    });

    expect(draft.templateId).toBe("tri-finals");
    expect(draft.event.teamCount).toBe(3);
    expect(draft.selectedPlayerIds).toHaveLength(15);
  });

  it("creates the requested template when resume mode is disabled", () => {
    const draft = resolveInitialSetupDraft({
      requestedTemplateId: "two-team-standard",
      shouldResume: false,
      storedDraft: null,
      players: mockPlayers,
    });

    expect(draft.templateId).toBe("two-team-standard");
    expect(draft.event.teamCount).toBe(2);
    expect(draft.selectedPlayerIds).toHaveLength(10);
  });
});
