import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockPlayers } from "@/lib/data/mock-players";
import { buildDraftPreview } from "@/lib/setup/build-draft-preview";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import type { PublishedSetup } from "@/lib/types";

type StorageRecord = Record<string, string>;

function installWindowMock(initialState: StorageRecord = {}) {
  const store = new Map(Object.entries(initialState));
  const dispatchEvent = vi.fn(() => true);

  const windowMock = {
    localStorage: {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
      removeItem(key: string) {
        store.delete(key);
      },
    },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent,
  };

  vi.stubGlobal("window", windowMock);

  return {
    dispatchEvent,
  };
}

function makePublishedSetup(): PublishedSetup {
  const draft = createSetupDraft({
    templateId: "tri-finals",
    players: mockPlayers,
  });

  return {
    ...draft,
    publishedAt: "2026-03-31T16:00:00.000Z",
  };
}

describe("setup storage snapshots", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the same published setups reference while storage is unchanged", async () => {
    const publishedSetup = makePublishedSetup();

    installWindowMock({
      "tangshi-cup:published-setups": JSON.stringify([publishedSetup]),
    });

    const { getPublishedSetupsSnapshot } = await import("@/lib/setup/storage");

    const first = getPublishedSetupsSnapshot();
    const second = getPublishedSetupsSnapshot();

    expect(second).toBe(first);
  });

  it("returns the same draft reference while storage is unchanged", async () => {
    const draft = createSetupDraft({
      templateId: "two-team-standard",
      players: mockPlayers,
    });

    installWindowMock({
      "tangshi-cup:season-setup-draft": JSON.stringify(draft),
    });

    const { getSetupDraftSnapshot } = await import("@/lib/setup/storage");

    const first = getSetupDraftSnapshot();
    const second = getSetupDraftSnapshot();

    expect(second).toBe(first);
  });

  it("returns a new published setups reference after storage changes", async () => {
    const firstPublishedSetup = makePublishedSetup();
    const secondPublishedSetup = {
      ...makePublishedSetup(),
      id: "second-setup",
      publishedAt: "2026-03-31T16:05:00.000Z",
    };

    installWindowMock({
      "tangshi-cup:published-setups": JSON.stringify([firstPublishedSetup]),
    });

    const { getPublishedSetupsSnapshot } = await import("@/lib/setup/storage");

    const first = getPublishedSetupsSnapshot();
    window.localStorage.setItem("tangshi-cup:published-setups", JSON.stringify([firstPublishedSetup, secondPublishedSetup]));
    const second = getPublishedSetupsSnapshot();

    expect(second).not.toBe(first);
    expect(second).toHaveLength(2);
  });

  it("normalizes legacy published setups whose flow is missing team arrays", async () => {
    const draft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });
    const preview = buildDraftPreview(
      {
        ...draft,
        captainIds: draft.selectedPlayerIds.slice(0, 3),
      },
      mockPlayers,
    );
    const legacySetup = {
      ...draft,
      generatedTeams: preview.teams?.teams,
      flow: {
        ...preview.flow,
        teams: undefined,
      },
      publishedAt: "2026-03-31T16:00:00.000Z",
    } as unknown as PublishedSetup;

    installWindowMock({
      "tangshi-cup:published-setups": JSON.stringify([legacySetup]),
    });

    const { getPublishedSetupsSnapshot } = await import("@/lib/setup/storage");
    const [normalizedSetup] = getPublishedSetupsSnapshot();

    expect(normalizedSetup.generatedTeams).toHaveLength(3);
    expect(normalizedSetup.flow?.teams).toHaveLength(3);
    expect(normalizedSetup.flow?.phases.length).toBeGreaterThan(0);
  });

  it("deletes a published setup and refreshes the snapshot", async () => {
    const firstPublishedSetup = makePublishedSetup();
    const secondPublishedSetup = {
      ...makePublishedSetup(),
      id: "second-setup",
      event: {
        ...makePublishedSetup().event,
        slug: "s2-second-event",
        title: "唐氏杯 S2 第二战",
      },
      publishedAt: "2026-03-31T16:05:00.000Z",
    };

    installWindowMock({
      "tangshi-cup:published-setups": JSON.stringify([firstPublishedSetup, secondPublishedSetup]),
    });

    const { deletePublishedSetup, getPublishedSetupsSnapshot } = await import("@/lib/setup/storage");

    deletePublishedSetup(firstPublishedSetup.event.slug);

    const remaining = getPublishedSetupsSnapshot();

    expect(remaining).toHaveLength(1);
    expect(remaining[0].event.slug).toBe("s2-second-event");
  });

  it("does not dispatch a storage change event when the draft payload is unchanged", async () => {
    const draft = createSetupDraft({
      templateId: "tri-finals",
      players: mockPlayers,
    });

    const { dispatchEvent } = installWindowMock({
      "tangshi-cup:season-setup-draft": JSON.stringify(draft),
    });

    const { saveSetupDraft } = await import("@/lib/setup/storage");

    saveSetupDraft(draft);

    expect(dispatchEvent).not.toHaveBeenCalled();
  });
});
