"use client";

import { useSyncExternalStore } from "react";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { seasonStories } from "@/lib/data/mock-site";
import { getChronicleEntriesSnapshot, subscribeChronicleStorage } from "@/lib/chronicle/storage";

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
          <div className="flex flex-wrap items-center gap-3">
            <Pill>{story.tag}</Pill>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{story.dateLabel}</p>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-stone-50">{story.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-400">{story.summary}</p>
          {index < entries.length - 1 ? <div className="mt-6 border-b border-dashed border-white/8" /> : null}
        </div>
      ))}
    </GlowCard>
  );
}
