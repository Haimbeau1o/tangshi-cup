import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Player, RuleModifier } from "@/lib/types";

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

function makePlayer(id: string): Player {
  return {
    id,
    slug: id,
    nickname: `选手-${id}`,
    riotId: `${id}#CN`,
    mainRole: "flex",
    preferredAgents: ["Skye"],
    highestRank: "黄金",
  };
}

function makeRuleModifier(id: string): RuleModifier {
  return {
    id,
    title: `规则-${id}`,
    category: "story",
    impact: "atmosphere",
    description: "测试规则卡",
  };
}

describe("content storage", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns default players and rules when local storage is empty", async () => {
    installWindowMock();

    const { getPlayersSnapshot, getRuleModifiersSnapshot } = await import("@/lib/content/storage");

    expect(getPlayersSnapshot().length).toBeGreaterThan(0);
    expect(getRuleModifiersSnapshot().length).toBeGreaterThan(0);
  });

  it("can upsert and delete a player", async () => {
    installWindowMock();

    const { getPlayersSnapshot, upsertPlayer, deletePlayer } = await import("@/lib/content/storage");

    const created = upsertPlayer(makePlayer("custom-player"));
    const afterCreate = getPlayersSnapshot();

    expect(afterCreate.some((player) => player.id === created.id)).toBe(true);

    deletePlayer(created.id);

    expect(getPlayersSnapshot().some((player) => player.id === created.id)).toBe(false);
  });

  it("replaces the player library when importing a collection", async () => {
    installWindowMock();

    const { importPlayers, getPlayersSnapshot } = await import("@/lib/content/storage");

    importPlayers([makePlayer("import-a"), makePlayer("import-b")]);

    expect(getPlayersSnapshot().map((player) => player.id)).toEqual(["import-a", "import-b"]);
  });

  it("can upsert and delete rule modifiers", async () => {
    installWindowMock();

    const { getRuleModifiersSnapshot, upsertRuleModifier, deleteRuleModifier } = await import("@/lib/content/storage");

    const modifier = makeRuleModifier("custom-rule");
    upsertRuleModifier(modifier);

    expect(getRuleModifiersSnapshot().some((item) => item.id === modifier.id)).toBe(true);

    deleteRuleModifier(modifier.id);

    expect(getRuleModifiersSnapshot().some((item) => item.id === modifier.id)).toBe(false);
  });
});
