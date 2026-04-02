import { describe, expect, it } from "vitest";

import { mockPlayers } from "@/lib/data/mock-players";
import { buildSeasonArchive } from "@/lib/seasons/build-season-archive";
import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import type { ChronicleEntry, PublishedSetup } from "@/lib/types";

function makePublishedSetup({
  seasonLabel,
  seasonSlug,
  seasonName,
  seasonTheme,
  eventSlug,
  eventTitle,
  publishedAt,
  championName,
}: {
  seasonLabel: string;
  seasonSlug: string;
  seasonName: string;
  seasonTheme: string;
  eventSlug: string;
  eventTitle: string;
  publishedAt: string;
  championName: string;
}): PublishedSetup {
  const draft = createSetupDraft({
    templateId: "tri-finals",
    players: mockPlayers,
  });

  return {
    ...draft,
    season: {
      ...draft.season,
      label: seasonLabel,
      slug: seasonSlug,
      name: seasonName,
      theme: seasonTheme,
    },
    event: {
      ...draft.event,
      slug: eventSlug,
      title: eventTitle,
    },
    publishedAt,
    generatedTeams: [
      {
        id: "team-1",
        name: championName,
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
          name: championName,
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

function makeChronicleEntry({
  seasonSlug,
  eventSlug,
  eventTitle,
  championName,
  mvpName,
  svpName,
  updatedAt,
}: {
  seasonSlug: string;
  eventSlug: string;
  eventTitle: string;
  championName: string;
  mvpName: string;
  svpName: string;
  updatedAt: string;
}): ChronicleEntry {
  return {
    id: `chronicle:${eventSlug}`,
    eventSlug,
    eventTitle,
    seasonSlug,
    title: `${eventTitle} 冠军归档`,
    dateLabel: `${seasonSlug.toUpperCase()} / 冠军归档`,
    summary: `${championName} 完成归档，MVP：${mvpName}，SVP：${svpName}。`,
    tag: "Champion",
    championName,
    mvpName,
    svpName,
    updatedAt,
  };
}

describe("buildSeasonArchive", () => {
  it("builds synced season summaries from local events and chronicle entries", () => {
    const s2Setup = makePublishedSetup({
      seasonLabel: "S2",
      seasonSlug: "s2",
      seasonName: "王朝试炼",
      seasonTheme: "复仇线全面升级。",
      eventSlug: "s2-tri-finals",
      eventTitle: "唐氏杯 S2 三强试炼",
      publishedAt: "2026-04-02T10:00:00.000Z",
      championName: "风暴队",
    });
    const s3Setup = makePublishedSetup({
      seasonLabel: "S3",
      seasonSlug: "s3",
      seasonName: "夜战新章",
      seasonTheme: "把战队故事真正沉淀下来。",
      eventSlug: "s3-carnival-night",
      eventTitle: "唐氏杯 S3 嘉年华夜",
      publishedAt: "2026-04-03T10:00:00.000Z",
      championName: "雷霆队",
    });
    const chronicleEntry = makeChronicleEntry({
      seasonSlug: "s3",
      eventSlug: "s3-carnival-night",
      eventTitle: "唐氏杯 S3 嘉年华夜",
      championName: "雷霆队",
      mvpName: "阿七",
      svpName: "老白",
      updatedAt: "2026-04-03T12:00:00.000Z",
    });

    const archive = buildSeasonArchive({
      publishedSetups: [s2Setup, s3Setup],
      chronicleEntries: [chronicleEntry],
    });

    expect(archive.summaries[0].slug).toBe("s3");
    expect(archive.summaries[0].champion).toBe("雷霆队");
    expect(archive.summaries[0].mvp).toBe("阿七");
    expect(archive.summaries[0].record).toContain("1 场赛事");
    expect(archive.summaries[1].slug).toBe("s2");
  });

  it("builds a season detail view with real event cards and a replay timeline", () => {
    const setup = makePublishedSetup({
      seasonLabel: "S4",
      seasonSlug: "s4",
      seasonName: "宿敌夜",
      seasonTheme: "要把这一季的过程全留下来。",
      eventSlug: "s4-tri-finals",
      eventTitle: "唐氏杯 S4 三强试炼",
      publishedAt: "2026-04-04T10:00:00.000Z",
      championName: "神罚俱乐部",
    });
    const chronicleEntry = makeChronicleEntry({
      seasonSlug: "s4",
      eventSlug: "s4-tri-finals",
      eventTitle: "唐氏杯 S4 三强试炼",
      championName: "神罚俱乐部",
      mvpName: "阿七",
      svpName: "老白",
      updatedAt: "2026-04-04T12:00:00.000Z",
    });

    const archive = buildSeasonArchive({
      publishedSetups: [setup],
      chronicleEntries: [chronicleEntry],
    });
    const detail = archive.details.s4;

    expect(detail).toBeDefined();
    expect(detail.season.name).toBe("宿敌夜");
    expect(detail.events[0].slug).toBe("s4-tri-finals");
    expect(detail.events[0].championName).toBe("神罚俱乐部");
    expect(detail.timeline[0].href).toBe("/events/s4-tri-finals");
    expect(detail.timeline.some((item) => item.tag === "Champion")).toBe(true);
    expect(detail.timeline.some((item) => item.tag === "Event")).toBe(true);
  });
});
