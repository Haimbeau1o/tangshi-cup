// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SeasonsLiveView } from "@/components/seasons/seasons-live-view";
import { mockPlayers } from "@/lib/data/mock-players";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import type { ChronicleEntry, PublishedSetup } from "@/lib/types";

const useHydratedMock = vi.fn();
const getPublishedSetupsSnapshotMock = vi.fn();
const getChronicleEntriesSnapshotMock = vi.fn();

vi.mock("@/lib/use-hydrated", () => ({
  useHydrated: () => useHydratedMock(),
}));

vi.mock("@/lib/setup/storage", () => ({
  subscribeSetupStorage: () => () => {},
  getPublishedSetupsSnapshot: () => getPublishedSetupsSnapshotMock(),
}));

vi.mock("@/lib/chronicle/storage", () => ({
  subscribeChronicleStorage: () => () => {},
  getChronicleEntriesSnapshot: () => getChronicleEntriesSnapshotMock(),
}));

function makePublishedSetup(): PublishedSetup {
  const draft = createSetupDraft({
    templateId: "tri-finals",
    players: mockPlayers,
  });

  return {
    ...draft,
    season: {
      ...draft.season,
      label: "S3",
      slug: "s3",
      name: "夜战新章",
      theme: "这里应该展示本地真实赛季。",
    },
    event: {
      ...draft.event,
      slug: "s3-tri-finals",
      title: "唐氏杯 S3 三强试炼",
    },
    publishedAt: "2026-04-03T10:00:00.000Z",
    generatedTeams: [
      {
        id: "team-1",
        name: "雷霆队",
        players: mockPlayers.slice(0, 5),
        totalPower: 10,
        averagePower: 2,
        coveredRoles: ["duelist", "initiator", "controller", "sentinel", "flex"],
      },
    ],
    flow: {
      layout: "series",
      teams: [
        {
          id: "team-1",
          name: "雷霆队",
          players: mockPlayers.slice(0, 5),
          totalPower: 10,
          averagePower: 2,
          coveredRoles: ["duelist", "initiator", "controller", "sentinel", "flex"],
        },
      ],
      phases: [],
      championTeamId: "team-1",
    },
  };
}

function makeChronicleEntry(): ChronicleEntry {
  return {
    id: "chronicle:s3-tri-finals",
    eventSlug: "s3-tri-finals",
    eventTitle: "唐氏杯 S3 三强试炼",
    seasonSlug: "s3",
    title: "唐氏杯 S3 三强试炼 冠军归档",
    dateLabel: "S3 / 冠军归档",
    summary: "雷霆队完成归档，MVP：阿七，SVP：老白。",
    tag: "Champion",
    championName: "雷霆队",
    mvpName: "阿七",
    svpName: "老白",
    updatedAt: "2026-04-03T12:00:00.000Z",
  };
}

describe("SeasonsLiveView", () => {
  beforeEach(() => {
    useHydratedMock.mockReset();
    getPublishedSetupsSnapshotMock.mockReset();
    getChronicleEntriesSnapshotMock.mockReset();
  });

  it("renders synced local seasons when browser storage already has event history", () => {
    useHydratedMock.mockReturnValue(true);
    getPublishedSetupsSnapshotMock.mockReturnValue([makePublishedSetup()]);
    getChronicleEntriesSnapshotMock.mockReturnValue([makeChronicleEntry()]);

    render(<SeasonsLiveView />);

    expect(screen.getByText("夜战新章")).not.toBeNull();
    expect(screen.getByText("雷霆队")).not.toBeNull();
    expect(screen.getByRole("link", { name: "打开赛季" }).getAttribute("href")).toBe("/seasons/s3");
  });
});
