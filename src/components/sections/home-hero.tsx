"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import type { EventCard, RuleModifier, TeamBalanceResult, TournamentFormatPreset } from "@/lib/types";

type HomeHeroProps = {
  event: EventCard;
  recommendation: TournamentFormatPreset;
  balance: TeamBalanceResult;
  modifiers: RuleModifier[];
};

export function HomeHero({ event, recommendation, balance, modifiers }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(33,211,193,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,95,31,0.18),transparent_30%)]" />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative z-10"
        >
          <Pill>Season S1 • Private Invitational</Pill>
          <h1 className="mt-6 font-display text-6xl uppercase leading-none tracking-[0.08em] text-stone-50 sm:text-7xl lg:text-[7rem]">
            唐氏杯
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300/82 sm:text-lg">
            一个给朋友局无畏契约 5v5、三队轮换和四队嘉年华准备的比赛控制台。它负责选人、战力平衡、
            赛制推荐、趣味机制和赛季编年史，把“自己玩”也包装成一场像样的民间邀请赛。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/events/${event.slug}`}
              className="rounded-full bg-[#ff5e3a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff734f]"
            >
              打开当前赛事
            </Link>
            <Link
              href="/players"
              className="rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
            >
              查看选手数据库
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative z-10 space-y-5"
        >
          <GlowCard className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Tonight Recommended</p>
              <Pill>{event.teamCount} Teams</Pill>
            </div>
            <div>
              <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-stone-50">{recommendation.name}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-300/80">{recommendation.summary}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-stone-200/88">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Match Count</p>
                <p className="mt-2 font-display text-2xl text-stone-50">{recommendation.matchCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Gap</p>
                <p className="mt-2 font-display text-2xl text-stone-50">{balance.balanceGapPercent}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Quality</p>
                <p className="mt-2 font-display text-2xl text-stone-50">{balance.qualityBand}</p>
              </div>
            </div>
          </GlowCard>

          <GlowCard className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-300/70">Fun Modifiers</p>
            {modifiers.slice(0, 3).map((modifier) => (
              <div key={modifier.id} className="flex items-start justify-between gap-4 border-t border-white/8 pt-3 first:border-t-0 first:pt-0">
                <div>
                  <p className="text-sm font-semibold text-stone-100">{modifier.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-400">{modifier.description}</p>
                </div>
                <Pill className="shrink-0 text-[10px]">{modifier.impact}</Pill>
              </div>
            ))}
          </GlowCard>
        </motion.div>
      </div>
    </section>
  );
}
