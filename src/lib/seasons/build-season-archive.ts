import type {
  ChronicleEntry,
  EventTone,
  MatchSeriesType,
  PublishedSetup,
  SeasonIdentity,
  SeasonStory,
  SeasonSummary,
} from "@/lib/types";

export type SeasonArchiveEvent = {
  id: string;
  slug: string;
  title: string;
  teamCount: 2 | 3 | 4;
  bestOf: MatchSeriesType;
  tone: EventTone;
  formatId: string;
  championName: string;
  headline: string;
  publishedAt: string;
  chronicled: boolean;
};

export type SeasonArchiveTimelineItem = SeasonStory & {
  href?: string;
  source: "chronicle" | "event";
  updatedAt: string;
};

export type SeasonArchiveDetail = {
  summary: SeasonSummary;
  season: SeasonIdentity;
  events: SeasonArchiveEvent[];
  timeline: SeasonArchiveTimelineItem[];
};

type BuildSeasonArchiveInput = {
  publishedSetups: PublishedSetup[];
  chronicleEntries: ChronicleEntry[];
};

type SeasonBucket = {
  slug: string;
  setups: PublishedSetup[];
  chronicleEntries: ChronicleEntry[];
  latestActivityAt: string;
};

function parseSeasonSequence(label: string) {
  const match = label.trim().match(/^s\s*(\d+)$/i);

  return match ? Number(match[1]) : -1;
}

function sortByTimeDesc<T>(items: T[], getValue: (item: T) => string) {
  return [...items].sort((left, right) => {
    return new Date(getValue(right)).getTime() - new Date(getValue(left)).getTime();
  });
}

function resolveChampionNameFromSetup(setup?: PublishedSetup) {
  if (!setup?.flow?.championTeamId) {
    return "待决出";
  }

  return (
    setup.generatedTeams?.find((team) => team.id === setup.flow?.championTeamId)?.name ??
    setup.flow.teams.find((team) => team.id === setup.flow?.championTeamId)?.name ??
    "待决出"
  );
}

function deriveSeasonIdentity(setup: PublishedSetup | undefined, bucket: SeasonBucket): SeasonIdentity {
  if (setup) {
    return setup.season;
  }

  const fallbackLabel = bucket.slug.toUpperCase();

  return {
    slug: bucket.slug,
    label: fallbackLabel,
    cupName: "唐氏杯",
    name: "本地归档赛季",
    theme: "这个赛季来自浏览器本地赛事记忆。",
    tagline: "等待更多赛事继续补全赛季脉络。",
  };
}

function buildSummary(bucket: SeasonBucket): SeasonSummary {
  const sortedSetups = sortByTimeDesc(bucket.setups, (setup) => setup.publishedAt);
  const sortedEntries = sortByTimeDesc(bucket.chronicleEntries, (entry) => entry.updatedAt);
  const latestSetup = sortedSetups[0];
  const latestEntry = sortedEntries[0];
  const season = deriveSeasonIdentity(latestSetup, bucket);

  return {
    id: `season:${bucket.slug}`,
    slug: bucket.slug,
    name: season.name,
    label: season.label,
    theme: season.theme,
    champion: latestEntry?.championName ?? resolveChampionNameFromSetup(latestSetup),
    mvp: latestEntry?.mvpName ?? "待评选",
    record: `${bucket.setups.length} 场赛事 / ${bucket.chronicleEntries.length} 次归档`,
    story: latestEntry?.summary ?? season.tagline ?? season.theme,
  };
}

function buildEvents(bucket: SeasonBucket): SeasonArchiveEvent[] {
  return sortByTimeDesc(bucket.setups, (setup) => setup.publishedAt).map((setup) => {
    const championName = resolveChampionNameFromSetup(setup);
    const chronicled = bucket.chronicleEntries.some((entry) => entry.eventSlug === setup.event.slug);

    return {
      id: `event:${setup.event.slug}`,
      slug: setup.event.slug,
      title: setup.event.title,
      teamCount: setup.event.teamCount,
      bestOf: setup.event.bestOf,
      tone: setup.event.tone,
      formatId: setup.event.formatId,
      championName,
      publishedAt: setup.publishedAt,
      chronicled,
      headline: chronicled
        ? `${setup.event.teamCount} 队 ${setup.event.bestOf.toUpperCase()} 已归档，当前冠军：${championName}。`
        : `${setup.event.teamCount} 队 ${setup.event.bestOf.toUpperCase()} 已建档，当前冠军位：${championName}。`,
    };
  });
}

function buildTimeline(bucket: SeasonBucket): SeasonArchiveTimelineItem[] {
  const chronicleTimeline = bucket.chronicleEntries.map((entry) => ({
    id: entry.id,
    seasonSlug: entry.seasonSlug,
    title: entry.title,
    dateLabel: entry.dateLabel,
    summary: entry.summary,
    tag: entry.tag,
    href: `/events/${entry.eventSlug}`,
    source: "chronicle" as const,
    updatedAt: entry.updatedAt,
  }));
  const setupTimeline = bucket.setups.map((setup) => ({
    id: `timeline:${setup.event.slug}`,
    seasonSlug: setup.season.slug,
    title: `${setup.event.title} 已建档`,
    dateLabel: `${setup.season.label} / 赛事建档`,
    summary: `${setup.event.teamCount} 队 ${setup.event.bestOf.toUpperCase()} 赛制已保存，可继续回到赛事控制台推进比分。`,
    tag: "Event",
    href: `/events/${setup.event.slug}`,
    source: "event" as const,
    updatedAt: setup.publishedAt,
  }));

  return sortByTimeDesc([...chronicleTimeline, ...setupTimeline], (item) => item.updatedAt);
}

function buildBucket(slug: string, publishedSetups: PublishedSetup[], chronicleEntries: ChronicleEntry[]): SeasonBucket {
  const setups = publishedSetups.filter((setup) => setup.season.slug === slug);
  const relatedChronicleEntries = chronicleEntries.filter((entry) => entry.seasonSlug === slug);
  const latestActivityAt = sortByTimeDesc(
    [
      ...setups.map((setup) => setup.publishedAt),
      ...relatedChronicleEntries.map((entry) => entry.updatedAt),
    ],
    (value) => value,
  )[0] ?? new Date(0).toISOString();

  return {
    slug,
    setups,
    chronicleEntries: relatedChronicleEntries,
    latestActivityAt,
  };
}

export function buildSeasonArchive({ publishedSetups, chronicleEntries }: BuildSeasonArchiveInput) {
  const seasonSlugs = Array.from(
    new Set([
      ...publishedSetups.map((setup) => setup.season.slug),
      ...chronicleEntries.map((entry) => entry.seasonSlug),
    ]),
  );
  const buckets = seasonSlugs.map((slug) => buildBucket(slug, publishedSetups, chronicleEntries));
  const sortedBuckets = [...buckets].sort((left, right) => {
    const sequenceGap =
      parseSeasonSequence(right.setups[0]?.season.label ?? right.slug.toUpperCase()) -
      parseSeasonSequence(left.setups[0]?.season.label ?? left.slug.toUpperCase());

    if (sequenceGap !== 0) {
      return sequenceGap;
    }

    return new Date(right.latestActivityAt).getTime() - new Date(left.latestActivityAt).getTime();
  });

  const summaries = sortedBuckets.map(buildSummary);
  const details = Object.fromEntries(
    sortedBuckets.map((bucket) => {
      const latestSetup = sortByTimeDesc(bucket.setups, (setup) => setup.publishedAt)[0];
      const season = deriveSeasonIdentity(latestSetup, bucket);
      const summary = summaries.find((item) => item.slug === bucket.slug) ?? buildSummary(bucket);

      return [
        bucket.slug,
        {
          summary,
          season,
          events: buildEvents(bucket),
          timeline: buildTimeline(bucket),
        } satisfies SeasonArchiveDetail,
      ];
    }),
  ) as Record<string, SeasonArchiveDetail>;

  return {
    summaries,
    details,
  };
}
