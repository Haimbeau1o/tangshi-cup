import { describe, expect, it } from "vitest";

import { mockPlayers } from "@/lib/data/mock-players";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import { syncGeneratedDraftIdentity } from "@/lib/setup/sync-generated-draft-identity";

describe("syncGeneratedDraftIdentity", () => {
  it("updates generated event title and slug when season label changes", () => {
    const draft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });

    const nextDraft = syncGeneratedDraftIdentity(draft, {
      season: {
        ...draft.season,
        label: "S3",
        slug: "s3",
      },
    });

    expect(nextDraft.season.label).toBe("S3");
    expect(nextDraft.event.title).toBe("唐氏杯 S3 三强试炼");
    expect(nextDraft.event.slug).toBe("s3-tri-finals");
  });

  it("preserves custom event titles that were manually edited", () => {
    const draft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });
    const customDraft = {
      ...draft,
      event: {
        ...draft.event,
        title: "唐氏杯 群友冠军夜",
        slug: "custom-finals-night",
      },
    };

    const nextDraft = syncGeneratedDraftIdentity(customDraft, {
      season: {
        ...customDraft.season,
        label: "S3",
        slug: "s3",
      },
    });

    expect(nextDraft.event.title).toBe("唐氏杯 群友冠军夜");
    expect(nextDraft.event.slug).toBe("custom-finals-night");
  });
});
