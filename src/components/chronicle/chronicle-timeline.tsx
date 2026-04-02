"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { seasonStories } from "@/lib/data/mock-site";
import { getChronicleEntriesSnapshot, subscribeChronicleStorage } from "@/lib/chronicle/storage";
import type { ChronicleEntry, SeasonStory } from "@/lib/types";

function isChronicleEntry(entry: ChronicleEntry | SeasonStory): entry is ChronicleEntry {
  return "eventSlug" in entry;
}

export function ChronicleTimeline() {
  const chronicleEntries = useSyncExternalStore(
    subscribeChronicleStorage,
    getChronicleEntriesSnapshot,
    getChronicleEntriesSnapshot,
  );
  const entries = chronicleEntries.length ? chronicleEntries : seasonStories;

  return (
    <GlowCard className="space-y-6">
      {entries.map((story, index) => (
        <div key={story.id} className="relative border-l border-white/12 pl-6">
          <span className="absolute -left-[8px] top-2 size-3.5 rounded-full bg-cyan-300 shadow-[0_0_0_6px_rgba(33,211,193,0.15)]" />
          {isChronicleEntry(story) ? (
            <Link href={`/events/${story.eventSlug}`} className="group block rounded-[22px] px-2 py-1 transition hover:bg-white/4">
              <div className="flex flex-wrap items-center gap-3">
                <Pill>{story.tag}</Pill>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{story.dateLabel}</p>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-stone-50 transition group-hover:text-cyan-100">{story.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-400">{story.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {story.championName ? <Pill>{`冠军 ${story.championName}`}</Pill> : null}
                {story.mvpName ? <Pill>{`MVP ${story.mvpName}`}</Pill> : null}
                {story.svpName ? <Pill>{`SVP ${story.svpName}`}</Pill> : null}
              </div>
              <p className="mt-3 text-xs leading-6 text-cyan-200/90">点击回看赛事流程图、比分推进记录和赛后荣誉确认。</p>
            </Link>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Pill>{story.tag}</Pill>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{story.dateLabel}</p>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-stone-50">{story.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-400">{story.summary}</p>
            </>
          )}
          {index < entries.length - 1 ? <div className="mt-6 border-b border-dashed border-white/8" /> : null}
        </div>
      ))}
    </GlowCard>
  );
}
