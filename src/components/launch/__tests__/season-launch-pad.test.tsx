// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SeasonLaunchPad } from "@/components/launch/season-launch-pad";
import { mockPlayers } from "@/lib/data/mock-players";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import type { PublishedSetup } from "@/lib/types";

const useHydratedMock = vi.fn();
const getSetupDraftSnapshotMock = vi.fn();
const getPublishedSetupsSnapshotMock = vi.fn();
const deletePublishedSetupMock = vi.fn();
const deleteChronicleEntryMock = vi.fn();

vi.mock("@/lib/use-hydrated", () => ({
  useHydrated: () => useHydratedMock(),
}));

vi.mock("@/lib/setup/storage", () => ({
  subscribeSetupStorage: () => () => {},
  getSetupDraftSnapshot: () => getSetupDraftSnapshotMock(),
  getPublishedSetupsSnapshot: () => getPublishedSetupsSnapshotMock(),
  deletePublishedSetup: (...args: unknown[]) => deletePublishedSetupMock(...args),
}));

vi.mock("@/lib/chronicle/storage", () => ({
  deleteChronicleEntry: (...args: unknown[]) => deleteChronicleEntryMock(...args),
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
  beforeEach(() => {
    deletePublishedSetupMock.mockReset();
    deleteChronicleEntryMock.mockReset();
    getPublishedSetupsSnapshotMock.mockReset();
    getSetupDraftSnapshotMock.mockReset();
    useHydratedMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render archive cards before hydration completes", () => {
    useHydratedMock.mockReturnValue(false);
    getSetupDraftSnapshotMock.mockReturnValue(null);
    getPublishedSetupsSnapshotMock.mockReturnValue([makePublishedSetup()]);

    render(<SeasonLaunchPad />);

    expect(screen.queryByText("唐氏杯 S2 三强试炼")).toBeNull();
    expect(screen.getAllByText("正在读取本地赛事记忆...")).toHaveLength(2);
    expect(screen.queryByText(/当前建议 S2/)).toBeNull();
  });

  it("uses a generic new-season CTA instead of hard-coded S2 copy", () => {
    useHydratedMock.mockReturnValue(true);
    getSetupDraftSnapshotMock.mockReturnValue(null);
    getPublishedSetupsSnapshotMock.mockReturnValue([]);

    render(<SeasonLaunchPad />);

    expect(screen.getByRole("link", { name: "创建新赛季" })).not.toBeNull();
    expect(screen.queryByRole("link", { name: "直接创建 S2" })).toBeNull();
  });

  it("allows deleting a locally saved event from the archive rail", () => {
    useHydratedMock.mockReturnValue(true);
    getSetupDraftSnapshotMock.mockReturnValue(null);
    const setup = makePublishedSetup();
    getPublishedSetupsSnapshotMock.mockReturnValue([setup]);
    const confirmMock = vi.spyOn(window, "confirm").mockImplementation(() => true);

    render(<SeasonLaunchPad />);

    fireEvent.click(screen.getByRole("button", { name: `删除 ${setup.event.title}` }));

    expect(confirmMock).toHaveBeenCalledOnce();
    expect(deletePublishedSetupMock).toHaveBeenCalledWith(setup.event.slug);
    expect(deleteChronicleEntryMock).toHaveBeenCalledWith(setup.event.slug);
  });
});
