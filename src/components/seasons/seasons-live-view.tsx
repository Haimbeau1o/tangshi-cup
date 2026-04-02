"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { getChronicleEntriesSnapshot, subscribeChronicleStorage } from "@/lib/chronicle/storage";
import { seasons as mockSeasons } from "@/lib/data/mock-site";
import { buildSeasonArchive } from "@/lib/seasons/build-season-archive";
import { getPublishedSetupsSnapshot, subscribeSetupStorage } from "@/lib/setup/storage";
import { useHydrated } from "@/lib/use-hydrated";

export function SeasonsLiveView() {
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
  const summaries = isHydrated && archive.summaries.length ? archive.summaries : mockSeasons;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
      <SectionHeading
        eyebrow="Seasons"
        title="让唐氏杯从一场比赛变成连续历史"
        description="赛季页现在会优先读取你浏览器里的本地赛事与编年史归档。只要一届赛事已经初始化或同步冠军，这里就会跟着更新。"
      />

      {isHydrated && archive.summaries.length ? (
        <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-400/8 px-4 py-3 text-sm leading-7 text-cyan-100">
          当前展示的是本地赛季同步结果，首页、赛季页和编年史会共用同一份赛事记忆。
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {summaries.map((season) => (
          <GlowCard key={season.id} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Pill>{season.label}</Pill>
              <Link href={`/seasons/${season.slug}`} className="text-sm font-semibold text-cyan-300">
                打开赛季
              </Link>
            </div>
            <div>
              <h2 className="font-display text-5xl uppercase tracking-[0.08em] text-stone-50">{season.name}</h2>
              <p className="mt-3 text-base leading-8 text-stone-300/82">{season.theme}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Champion</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">{season.champion}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">MVP</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">{season.mvp}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Record</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">{season.record}</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-stone-400">{season.story}</p>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
