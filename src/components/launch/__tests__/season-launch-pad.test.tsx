// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SeasonLaunchPad } from "@/components/launch/season-launch-pad";
import { mockPlayers } from "@/lib/data/mock-players";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import type { PublishedSetup } from "@/lib/types";

const useHydratedMock = vi.fn();
const getSetupDraftSnapshotMock = vi.fn();
const getPublishedSetupsSnapshotMock = vi.fn();

vi.mock("@/lib/use-hydrated", () => ({
  useHydrated: () => useHydratedMock(),
}));

vi.mock("@/lib/setup/storage", () => ({
  subscribeSetupStorage: () => () => {},
  getSetupDraftSnapshot: () => getSetupDraftSnapshotMock(),
  getPublishedSetupsSnapshot: () => getPublishedSetupsSnapshotMock(),
}));

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

describe("SeasonLaunchPad", () => {
  it("does not render archive cards before hydration completes", () => {
    useHydratedMock.mockReturnValue(false);
    getSetupDraftSnapshotMock.mockReturnValue(null);
    getPublishedSetupsSnapshotMock.mockReturnValue([makePublishedSetup()]);

    render(<SeasonLaunchPad />);

    expect(screen.queryByText("唐氏杯 S2 三强试炼")).toBeNull();
    expect(screen.getByText("正在读取本地赛事记忆...")).not.toBeNull();
  });
});
