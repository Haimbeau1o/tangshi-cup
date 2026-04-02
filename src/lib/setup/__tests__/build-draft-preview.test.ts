import { describe, expect, it } from "vitest";

import { mockPlayers } from "@/lib/data/mock-players";
import { buildDraftPreview } from "@/lib/setup/build-draft-preview";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";

describe("buildDraftPreview", () => {
  it("adds team avatars and a match-state flow once the draft is ready", () => {
    const baseDraft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });

    const draft = {
      ...baseDraft,
      captainIds: baseDraft.selectedPlayerIds.slice(0, 3),
    };

    const preview = buildDraftPreview(draft, mockPlayers);

    expect(preview.teams?.teams.every((team) => team.avatarId && team.avatarSrc)).toBe(true);
    expect(preview.flow?.teams.every((team) => team.avatarId && team.avatarSrc)).toBe(true);
    expect(preview.flow?.phases[0].matches[0].slots[0].avatarSrc).toBeTruthy();
  });

  it("applies custom team names, slogans, and avatar overrides to the preview", () => {
    const baseDraft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });

    const draft = {
      ...baseDraft,
      captainIds: baseDraft.selectedPlayerIds.slice(0, 3),
      teamCustomizations: {
        "team-1": {
          name: "神罚俱乐部",
          slogan: "一枪不开，绝不后退",
          avatarSrc: "data:image/svg+xml;base64,custom-avatar",
          accentColor: "#ff3366",
        },
      },
    };

    const preview = buildDraftPreview(draft, mockPlayers);
    const customizedTeam = preview.teams?.teams.find((team) => team.id === "team-1");

    expect(customizedTeam?.name).toBe("神罚俱乐部");
    expect(customizedTeam?.slogan).toBe("一枪不开，绝不后退");
    expect(customizedTeam?.avatarSrc).toBe("data:image/svg+xml;base64,custom-avatar");
    expect(preview.flow?.teams.find((team) => team.id === "team-1")?.name).toBe("神罚俱乐部");
  });

  it("resolves custom team avatar assets from the avatar asset store", () => {
    const baseDraft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });

    const draft = {
      ...baseDraft,
      captainIds: baseDraft.selectedPlayerIds.slice(0, 3),
      teamCustomizations: {
        "team-1": {
          name: "神罚俱乐部",
          avatarAssetId: "asset-team-1",
        },
      },
    };

    const preview = buildDraftPreview(
      draft,
      mockPlayers,
      undefined,
      {
        "asset-team-1": {
          id: "asset-team-1",
          dataUrl: "data:image/webp;base64,asset-preview",
          updatedAt: "2026-03-31T20:00:00.000Z",
        },
      },
    );

    const customizedTeam = preview.teams?.teams.find((team) => team.id === "team-1");

    expect(customizedTeam?.avatarAssetId).toBe("asset-team-1");
    expect(customizedTeam?.avatarSrc).toBe("data:image/webp;base64,asset-preview");
  });
});
