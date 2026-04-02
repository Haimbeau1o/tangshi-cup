"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { events, getSeasonBySlug, getStoriesForSeason } from "@/lib/data/mock-site";
import { getChronicleEntriesSnapshot, subscribeChronicleStorage } from "@/lib/chronicle/storage";
import { buildSeasonArchive } from "@/lib/seasons/build-season-archive";
import { getPublishedSetupsSnapshot, subscribeSetupStorage } from "@/lib/setup/storage";
import { useHydrated } from "@/lib/use-hydrated";

type SeasonDetailViewProps = {
  slug: string;
};

export function SeasonDetailView({ slug }: SeasonDetailViewProps) {
  const isHydrated = useHydrated();
  const publishedSetups = useSyncExternalStore(
    subscribeSetupStorage,
    getPublishedSetupsSnapshot,
    getPublishedSetupsSnapshot,
  );
  const chronicleEntries = useSyncExternalStore(
    subscribeChronicleStorage,
    getChronicleEntriesSnapshot,
    getChronicleEntriesSnapshot,
  );
  const archive = useMemo(
    () =>
      buildSeasonArchive({
        publishedSetups,
        chronicleEntries,
      }),
    [chronicleEntries, publishedSetups],
  );
  const localDetail = archive.details[slug];
  const mockSeason = getSeasonBySlug(slug);
  const mockEvents = events.filter((event) => event.seasonSlug === slug);
  const mockStories = getStoriesForSeason(slug);

  if (!isHydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
        <GlowCard className="text-sm text-stone-400">正在同步本地赛季记忆...</GlowCard>
      </div>
    );
  }

  if (localDetail) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
        <GlowCard className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Pill>{localDetail.summary.label}</Pill>
            <Pill>{localDetail.summary.record}</Pill>
          </div>
          <h1 className="font-display text-6xl uppercase tracking-[0.08em] text-stone-50">{localDetail.season.name}</h1>
          <p className="max-w-3xl text-base leading-8 text-stone-300/82">{localDetail.season.theme}</p>
          <div className="rounded-[22px] border border-cyan-300/15 bg-cyan-400/8 px-4 py-3 text-sm leading-7 text-cyan-100">
            当前赛季详情来自本地赛事归档，新增赛事、同步冠军或删除本地记录后，这里会自动跟着变化。
          </div>
        </GlowCard>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <GlowCard className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Season Events</p>
            {localDetail.events.map((event) => (
              <div key={event.id} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-stone-50">{event.title}</h2>
                    <p className="mt-2 text-sm text-stone-400">{event.headline}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill>{event.teamCount} 队</Pill>
                      <Pill>{event.bestOf.toUpperCase()}</Pill>
                      <Pill>{event.chronicled ? "已归档" : "未归档"}</Pill>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Champion</p>
                    <p className="mt-2 text-sm font-semibold text-stone-100">{event.championName}</p>
                    <Link href={`/events/${event.slug}`} className="mt-4 inline-block text-sm font-semibold text-cyan-300">
                      打开赛事
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </GlowCard>

          <GlowCard className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Timeline</p>
            {localDetail.timeline.map((story) => (
              <div key={story.id} className="relative border-l border-white/12 pl-5">
                <span className="absolute -left-[7px] top-1 size-3 rounded-full bg-[#ff5e3a] shadow-[0_0_0_6px_rgba(255,94,58,0.14)]" />
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{story.dateLabel}</p>
                <h3 className="mt-2 text-lg font-semibold text-stone-50">{story.title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-400">{story.summary}</p>
                {story.href ? (
                  <Link href={story.href} className="mt-3 inline-block text-sm font-semibold text-cyan-300">
                    回看赛事
                  </Link>
                ) : null}
              </div>
            ))}
          </GlowCard>
        </div>
      </div>
    );
  }

  if (!mockSeason) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-10">
        <GlowCard className="space-y-4">
          <Pill>Not Found</Pill>
          <h1 className="font-display text-5xl uppercase tracking-[0.08em] text-stone-50">还没有找到这个赛季</h1>
          <p className="text-sm leading-7 text-stone-400">先去首页创建并保存一届新赛季，这里才会开始生成本地赛季档案。</p>
          <Link href="/" className="inline-flex rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10">
            返回启动台
          </Link>
        </GlowCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
      <GlowCard className="space-y-5">
        <Pill>{mockSeason.label}</Pill>
        <h1 className="font-display text-6xl uppercase tracking-[0.08em] text-stone-50">{mockSeason.name}</h1>
        <p className="max-w-3xl text-base leading-8 text-stone-300/82">{mockSeason.theme}</p>
      </GlowCard>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <GlowCard className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Season Events</p>
          {mockEvents.map((event) => (
            <div key={event.slug} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-stone-50">{event.title}</h2>
                  <p className="mt-2 text-sm text-stone-400">{event.headline}</p>
                </div>
                <Pill>{event.teamCount} 队</Pill>
              </div>
            </div>
          ))}
        </GlowCard>

        <GlowCard className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Timeline</p>
          {mockStories.map((story) => (
            <div key={story.id} className="relative border-l border-white/12 pl-5">
              <span className="absolute -left-[7px] top-1 size-3 rounded-full bg-[#ff5e3a] shadow-[0_0_0_6px_rgba(255,94,58,0.14)]" />
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{story.dateLabel}</p>
              <h3 className="mt-2 text-lg font-semibold text-stone-50">{story.title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-400">{story.summary}</p>
            </div>
          ))}
        </GlowCard>
      </div>
    </div>
  );
}
