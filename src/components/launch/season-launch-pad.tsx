"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { deleteChronicleEntry } from "@/lib/chronicle/storage";
import { getNextSeasonSequence } from "@/lib/seasons/get-next-season-sequence";
import {
  deletePublishedSetup,
  getPublishedSetupsSnapshot,
  getSetupDraftSnapshot,
  subscribeSetupStorage,
} from "@/lib/setup/storage";
import { setupTemplates } from "@/lib/setup/templates";
import type { PublishedSetup } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";

const toneLabels = {
  serious: "认真",
  balanced: "平衡",
  fun: "整活",
} as const;

export function SeasonLaunchPad() {
  const isHydrated = useHydrated();
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const draft = useSyncExternalStore(subscribeSetupStorage, getSetupDraftSnapshot, getSetupDraftSnapshot);
  const publishedSetups = useSyncExternalStore(
    subscribeSetupStorage,
    getPublishedSetupsSnapshot,
    getPublishedSetupsSnapshot,
  );

  const latestSetup = publishedSetups[0];
  const archiveSetups = publishedSetups.slice(0, 4);
  const nextSeasonLabel = `S${getNextSeasonSequence(publishedSetups)}`;
  const nextSeasonDisplay = isHydrated ? nextSeasonLabel : "读取中";

  function handleDeleteEvent(setup: PublishedSetup) {
    if (typeof window === "undefined") {
      return;
    }

    const confirmed = window.confirm(`确认删除 ${setup.event.title} 的本地赛事记录吗？这会同时移除对应的编年史条目。`);

    if (!confirmed) {
      return;
    }

    deletePublishedSetup(setup.event.slug);
    deleteChronicleEntry(setup.event.slug);
    setStorageMessage(`${setup.event.title} 已从本地记录中删除。`);
  }

  return (
    <div className="pb-24">
      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlowCard className="space-y-6">
            <Pill>Season Launch Pad</Pill>
            <div className="space-y-4">
              <h1 className="font-display text-6xl uppercase leading-none tracking-[0.08em] text-stone-50 sm:text-7xl">
                新赛季从这里启动
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-300/82">
                首页现在是唐氏杯的赛事指挥台。先定规模、BO 和规则，再从默认选手卡池里挑人，系统会自动做段位平衡、分配队徽，并生成可手动推进的赛事流程图。
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">支持规模</p>
                <p className="mt-2 font-display text-3xl text-stone-50">2 / 3 / 4</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">分组依据</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">最高段位平衡</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">流程控制</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">手动录比分，自动推进</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/setup/season?template=tri-finals"
                className="rounded-full bg-[#ff5e3a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff734f]"
              >
                创建新赛季
              </Link>
              <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100">
                赛季编号按本地记录自动递增，当前建议 {nextSeasonDisplay}
              </div>
              <Link
                href="/players"
                className="rounded-full border border-white/10 bg-white/6 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
              >
                查看默认选手池
              </Link>
            </div>
          </GlowCard>

          <div className="grid gap-5">
            <GlowCard className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Current Season</p>
              {!isHydrated ? (
                <p className="text-sm leading-7 text-stone-400">正在读取本地赛事记忆...</p>
              ) : latestSetup ? (
                <>
                  <h2 className="font-display text-4xl uppercase tracking-[0.08em] text-stone-50">{latestSetup.season.label}</h2>
                  <p className="text-sm leading-7 text-stone-400">{latestSetup.event.title}</p>
                  <div className="flex flex-wrap gap-2">
                    <Pill>{latestSetup.event.teamCount} 队</Pill>
                    <Pill>{latestSetup.event.bestOf.toUpperCase()}</Pill>
                    <Pill>{toneLabels[latestSetup.event.tone]}</Pill>
                  </div>
                  <Link href={`/events/${latestSetup.event.slug}`} className="text-sm font-semibold text-cyan-300">
                    查看初始化结果
                  </Link>
                </>
              ) : (
                <p className="text-sm leading-7 text-stone-400">当前还没有已保存赛事，最适合从下方模板直接开一届新的唐氏杯。</p>
              )}
            </GlowCard>

            <GlowCard className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Draft Memory</p>
              {!isHydrated ? (
                <p className="text-sm leading-7 text-stone-400">正在读取本地草稿...</p>
              ) : draft ? (
                <>
                  <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-stone-50">{draft.event.title}</h2>
                  <p className="text-sm leading-7 text-stone-400">已保存到第 {draft.currentStep} 步，可以继续完成新赛季初始化。</p>
                  <Link href="/setup/season?resume=1" className="text-sm font-semibold text-cyan-300">
                    继续编辑草稿
                  </Link>
                </>
              ) : (
                <p className="text-sm leading-7 text-stone-400">当前没有未完成草稿。你创建流程时，草稿会自动保存在本地浏览器。</p>
              )}
            </GlowCard>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-6 lg:px-10">
        <SectionHeading
          eyebrow="Templates"
          title="先选一张模板，再细调细节"
          description="为了让你开赛季更快，我把最常用的 2 队、3 队、4 队入口做成了模板卡，进去之后还可以再调 BO、规则和选手。"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {setupTemplates.map((template) => (
            <GlowCard key={template.id} className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{template.subtitle}</p>
                <h2 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">{template.title}</h2>
              </div>
              <p className="text-sm leading-7 text-stone-400">{template.summary}</p>
              <div className="flex flex-wrap gap-2">
                {template.chips.map((chip) => (
                  <Pill key={chip}>{chip}</Pill>
                ))}
              </div>
              <Link
                href={`/setup/season?template=${template.id}`}
                className="inline-flex rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
              >
                用这套模板开始
              </Link>
            </GlowCard>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl space-y-8 px-6 lg:px-10">
        <SectionHeading
          eyebrow="Archive"
          title="本地赛季记忆"
          description="这里先用浏览器本地存储做你们的赛事编年史。后续切 SQLite 时，这块数据结构可以直接平移。"
        />
        {storageMessage ? <p className="text-sm leading-7 text-cyan-200">{storageMessage}</p> : null}
        <div className="grid gap-5 lg:grid-cols-4">
          {!isHydrated ? (
            <GlowCard className="lg:col-span-4">
              <p className="text-sm leading-7 text-stone-400">正在读取本地赛事记忆...</p>
            </GlowCard>
          ) : archiveSetups.length ? (
            archiveSetups.map((setup) => (
              <GlowCard key={setup.event.slug} className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{setup.season.label}</p>
                  <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.08em] text-stone-50">{setup.event.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill>{setup.event.teamCount} 队</Pill>
                  <Pill>{setup.event.bestOf.toUpperCase()}</Pill>
                  <Pill>{toneLabels[setup.event.tone]}</Pill>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/events/${setup.event.slug}`} className="text-sm font-semibold text-cyan-300">
                    打开赛事控制台
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(setup)}
                    className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/16"
                    aria-label={`删除 ${setup.event.title}`}
                  >
                    删除记录
                  </button>
                </div>
              </GlowCard>
            ))
          ) : (
            <GlowCard className="lg:col-span-4">
              <p className="text-sm leading-7 text-stone-400">当前还没有可回看的已保存赛事。开一届新的唐氏杯之后，这里会开始积累编年史入口。</p>
            </GlowCard>
          )}
        </div>
      </section>
    </div>
  );
}
