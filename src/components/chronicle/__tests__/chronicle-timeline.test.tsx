// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChronicleTimeline } from "@/components/chronicle/chronicle-timeline";
import type { ChronicleEntry } from "@/lib/types";

const getChronicleEntriesSnapshotMock = vi.fn();

vi.mock("@/lib/chronicle/storage", () => ({
  subscribeChronicleStorage: () => () => {},
  getChronicleEntriesSnapshot: () => getChronicleEntriesSnapshotMock(),
}));

describe("ChronicleTimeline", () => {
  it("links saved chronicle entries back to the event replay and shows awards", () => {
    const entry: ChronicleEntry = {
      id: "chronicle:s1-tri-finals",
      eventSlug: "s1-tri-finals",
      eventTitle: "唐氏杯 S1 三强试炼",
      seasonSlug: "s1",
      title: "唐氏杯 S1 三强试炼 冠军归档",
      dateLabel: "S1 / 冠军归档",
      summary: "风暴队完成夺冠归档，MVP：阿七，SVP：老白。",
      tag: "Champion",
      championTeamId: "team-storm",
      championName: "风暴队",
      mvpPlayerId: "player-1",
      mvpName: "阿七",
      svpPlayerId: "player-2",
      svpName: "老白",
      votingNote: "请先让观众完成投票，再由主持人确认 MVP / SVP 并同步编年史。",
      updatedAt: "2026-04-02T10:00:00.000Z",
    };

    getChronicleEntriesSnapshotMock.mockReturnValue([entry]);

    render(<ChronicleTimeline />);

    const replayLink = screen.getByRole("link", { name: /唐氏杯 S1 三强试炼 冠军归档/i });

    expect(replayLink.getAttribute("href")).toBe("/events/s1-tri-finals");
    expect(screen.getByText("冠军 风暴队")).not.toBeNull();
    expect(screen.getByText("MVP 阿七")).not.toBeNull();
    expect(screen.getByText("SVP 老白")).not.toBeNull();
  });
});
