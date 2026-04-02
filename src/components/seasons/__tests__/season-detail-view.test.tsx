// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SeasonDetailView } from "@/components/seasons/season-detail-view";
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
      label: "S4",
      slug: "s4",
      name: "宿敌夜",
      theme: "应该展示赛季真实赛事卡。",
    },
    event: {
      ...draft.event,
      slug: "s4-tri-finals",
      title: "唐氏杯 S4 三强试炼",
    },
    publishedAt: "2026-04-04T10:00:00.000Z",
    generatedTeams: [
      {
        id: "team-1",
        name: "神罚俱乐部",
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
          name: "神罚俱乐部",
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
    id: "chronicle:s4-tri-finals",
    eventSlug: "s4-tri-finals",
    eventTitle: "唐氏杯 S4 三强试炼",
    seasonSlug: "s4",
    title: "唐氏杯 S4 三强试炼 冠军归档",
    dateLabel: "S4 / 冠军归档",
    summary: "神罚俱乐部完成归档，MVP：阿七，SVP：老白。",
    tag: "Champion",
    championName: "神罚俱乐部",
    mvpName: "阿七",
    svpName: "老白",
    updatedAt: "2026-04-04T12:00:00.000Z",
  };
}

describe("SeasonDetailView", () => {
  beforeEach(() => {
    useHydratedMock.mockReset();
    getPublishedSetupsSnapshotMock.mockReset();
    getChronicleEntriesSnapshotMock.mockReset();
  });

  it("renders synced season events and replay timeline from local data", () => {
    useHydratedMock.mockReturnValue(true);
    getPublishedSetupsSnapshotMock.mockReturnValue([makePublishedSetup()]);
    getChronicleEntriesSnapshotMock.mockReturnValue([makeChronicleEntry()]);

    render(<SeasonDetailView slug="s4" />);

    expect(screen.getByText("宿敌夜")).not.toBeNull();
    expect(screen.getByText("唐氏杯 S4 三强试炼")).not.toBeNull();
    expect(screen.getByText("神罚俱乐部")).not.toBeNull();
    expect(screen.getByRole("link", { name: "打开赛事" }).getAttribute("href")).toBe("/events/s4-tri-finals");
  });
});
