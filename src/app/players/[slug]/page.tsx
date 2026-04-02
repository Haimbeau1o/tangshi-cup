import { notFound } from "next/navigation";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { RankChip } from "@/components/ui/rank-chip";
import { getPlayerBySlug } from "@/lib/data/mock-site";
import { mockPlayers } from "@/lib/data/mock-players";
import { calculatePlayerPower } from "@/lib/player-rating";

type PlayerPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mockPlayers.map((player) => ({
    slug: player.slug,
  }));
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);

  return {
    title: player ? `${player.nickname} 档案` : "选手档案",
  };
}

export default async function PlayerDetailPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);

  if (!player) {
    notFound();
  }

  const power = calculatePlayerPower(player);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 lg:px-10">
      <GlowCard className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Player Dossier</p>
          <h1 className="text-4xl font-bold text-stone-50">{player.nickname}</h1>
          <p className="text-sm text-stone-400">{player.riotId}</p>

          <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
            <p className="font-display text-6xl uppercase leading-none text-cyan-300">{power}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-500">Balance Seed Power</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <RankChip rank={player.highestRank} showScore />
            <Pill>{player.mainRole}</Pill>
            {player.canCoach ? <Pill className="text-cyan-200">可做教练</Pill> : null}
            {player.isCaptain ? <Pill className="text-amber-100">可做队长</Pill> : null}
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-base leading-8 text-stone-300/82">{player.bio}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">定位</p>
              <p className="mt-3 text-2xl font-semibold text-stone-50">{player.mainRole}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">最高段位</p>
              <div className="mt-3">
                <RankChip rank={player.highestRank} className="text-xs" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">英雄池</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {player.preferredAgents.map((agent) => (
                <Pill key={agent}>{agent}</Pill>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-cyan-300/12 bg-cyan-400/6 p-5 text-sm leading-7 text-stone-300">
            当前版本的唐氏杯平衡只按最高段位折算，所以这里的 `P{power}` 只是初始化时的分组参考，不代表所有维度的真实强度。
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
