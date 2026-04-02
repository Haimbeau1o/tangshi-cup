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

describe("avatar asset storage", () => {
  beforeEach(() => {
    vi.resetModules();
    installWindowMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores avatar payloads by asset id and keeps stable snapshots when unchanged", async () => {
    const { getAvatarAssetsSnapshot, saveAvatarAsset } = await import("@/lib/assets/storage");

    const first = getAvatarAssetsSnapshot();

    await saveAvatarAsset({
      id: "asset-team-1",
      dataUrl: "data:image/webp;base64,AAA",
      updatedAt: "2026-03-31T20:00:00.000Z",
    });

    const second = getAvatarAssetsSnapshot();
    const third = getAvatarAssetsSnapshot();

    expect(first).toEqual({});
    expect(second["asset-team-1"]?.dataUrl).toBe("data:image/webp;base64,AAA");
    expect(third).toBe(second);
  });
});
