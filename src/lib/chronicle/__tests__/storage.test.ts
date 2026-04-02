// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type StorageRecord = Record<string, string>;

function installWindowMock(initialState: StorageRecord = {}) {
  const store = new Map(Object.entries(initialState));

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
    dispatchEvent() {
      return true;
    },
  };

  vi.stubGlobal("window", windowMock);
}

describe("chronicle storage", () => {
  beforeEach(() => {
    vi.resetModules();
    installWindowMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("upserts entries by event slug and returns stable snapshots until storage changes", async () => {
    const { getChronicleEntriesSnapshot, upsertChronicleEntry } = await import("@/lib/chronicle/storage");

    const first = getChronicleEntriesSnapshot();

    upsertChronicleEntry({
      id: "chronicle-s2-final",
      eventSlug: "s2-tri-finals",
      seasonSlug: "s2",
      title: "唐氏杯 S2 三强试炼冠军诞生",
      dateLabel: "S2 / 冠军归档",
      summary: "神罚俱乐部拿下首个同步到编年史的冠军。",
      tag: "Champion",
      championTeamId: "team-1",
      championName: "神罚俱乐部",
      updatedAt: "2026-03-31T20:20:00.000Z",
    });

    const second = getChronicleEntriesSnapshot();
    const third = getChronicleEntriesSnapshot();

    upsertChronicleEntry({
      id: "chronicle-s2-final-new",
      eventSlug: "s2-tri-finals",
      seasonSlug: "s2",
      title: "唐氏杯 S2 三强试炼冠军诞生",
      dateLabel: "S2 / 重新归档",
      summary: "神罚俱乐部重新同步了最新冠军信息。",
      tag: "Champion",
      championTeamId: "team-1",
      championName: "神罚俱乐部",
      updatedAt: "2026-03-31T20:30:00.000Z",
    });

    const fourth = getChronicleEntriesSnapshot();

    expect(first).toEqual([]);
    expect(second).toHaveLength(1);
    expect(third).toBe(second);
    expect(fourth).toHaveLength(1);
    expect(fourth[0].id).toBe("chronicle-s2-final-new");
    expect(fourth[0].dateLabel).toBe("S2 / 重新归档");
  });
});
