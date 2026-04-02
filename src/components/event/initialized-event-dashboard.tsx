"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { resolvePublishedSetupAvatarAssets } from "@/lib/assets/resolve-avatar-assets";
import { getAvatarAssetsSnapshot, loadAvatarAssets, subscribeAssetStorage } from "@/lib/assets/storage";
import { upsertChronicleEntry, getChronicleEntriesSnapshot, subscribeChronicleStorage } from "@/lib/chronicle/storage";
import { TournamentFlowRenderer } from "@/components/flow/tournament-flow-renderer";
import { getPlayersSnapshot, getRuleModifiersSnapshot, subscribeContentStorage } from "@/lib/content/storage";
import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { RankChip } from "@/components/ui/rank-chip";
import { TeamAvatar } from "@/components/ui/team-avatar";
import { getPublishedSetupsSnapshot, subscribeSetupStorage, upsertPublishedSetup } from "@/lib/setup/storage";
import { clearMatchResult, updateMatchResult } from "@/lib/tournament/update-match-result";
import type { PublishedSetup, TournamentMatchScore } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";

type InitializedEventDashboardProps = {
  slug: string;
};

const toneLabels = {
  serious: "认真",
  balanced: "平衡",
  fun: "整活",
} as const;

export function InitializedEventDashboard({ slug }: InitializedEventDashboardProps) {
  const isHydrated = useHydrated();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const publishedSetups = useSyncExternalStore(
    subscribeSetupStorage,
    getPublishedSetupsSnapshot,
    getPublishedSetupsSnapshot,
  );
  const avatarAssets = useSyncExternalStore(subscribeAssetStorage, getAvatarAssetsSnapshot, getAvatarAssetsSnapshot);
  const chronicleEntries = useSyncExternalStore(
    subscribeChronicleStorage,
    getChronicleEntriesSnapshot,
    getChronicleEntriesSnapshot,
  );
  const players = useSyncExternalStore(subscribeContentStorage, getPlayersSnapshot, getPlayersSnapshot);
  const ruleModifiers = useSyncExternalStore(
    subscribeContentStorage,
    getRuleModifiersSnapshot,
    getRuleModifiersSnapshot,
  );
  const storedSetup = useMemo<PublishedSetup | null>(
    () => publishedSetups.find((item) => item.event.slug === slug) ?? null,
    [publishedSetups, slug],
  );
  const setup = useMemo<PublishedSetup | null>(
    () => (storedSetup ? resolvePublishedSetupAvatarAssets(storedSetup, avatarAssets) : null),
    [avatarAssets, storedSetup],
  );
  const teams = useMemo(() => setup?.generatedTeams ?? [], [setup]);
  const champion = useMemo(
    () => teams.find((team) => team.id === setup?.flow?.championTeamId) ?? null,
    [setup?.flow?.championTeamId, teams],
  );
  const existingChronicleEntry = chronicleEntries.find((entry) => entry.eventSlug === setup?.event.slug) ?? null;
  const selectedModifiers = useMemo(
    () => (setup ? ruleModifiers.filter((modifier) => setup.ruleModifierIds.includes(modifier.id)) : []),
    [ruleModifiers, setup],
  );

  useEffect(() => {
    void loadAvatarAssets().catch(() => {
      setSyncMessage("本地队徽资源读取失败，当前先展示默认队徽。");
    });
  }, []);

  function patchPublishedSetup(nextFlowUpdater: (current: PublishedSetup) => PublishedSetup) {
    if (!storedSetup) {
      return;
    }

    upsertPublishedSetup(
      nextFlowUpdater({
        ...storedSetup,
        updatedAt: new Date().toISOString(),
      }),
    );
  }

  function handleScoreSelect(matchId: string, score: TournamentMatchScore) {
    patchPublishedSetup((current) => ({
      ...current,
      flow: current.flow ? updateMatchResult(current.flow, matchId, score) : current.flow,
    }));
  }

  function handleClearMatch(matchId: string) {
    patchPublishedSetup((current) => ({
      ...current,
      flow: current.flow ? clearMatchResult(current.flow, matchId) : current.flow,
    }));
  }

  function handleSyncChronicle() {
    if (!setup || !champion) {
      return;
    }

    upsertChronicleEntry({
      id: `chronicle:${setup.event.slug}`,
      eventSlug: setup.event.slug,
      seasonSlug: setup.season.slug,
      title: `${setup.event.title} 冠军归档`,
      dateLabel: `${setup.season.label} / 冠军归档`,
      summary: `${champion.name} 已被正式写入编年史，作为 ${setup.event.title} 的冠军队伍存档。`,
      tag: "Champion",
      championTeamId: champion.id,
      championName: champion.name,
      updatedAt: new Date().toISOString(),
    });
    setSyncMessage(existingChronicleEntry ? "编年史已重新同步为最新冠军结果。" : "当前冠军已同步到编年史。");
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <GlowCard className="text-sm text-stone-400">正在读取初始化结果...</GlowCard>
      </div>
    );
  }

  if (!setup || !setup.flow || !setup.generatedTeams) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-10">
        <GlowCard className="space-y-4">
          <Pill>Not Found</Pill>
          <h1 className="font-display text-5xl uppercase tracking-[0.08em] text-stone-50">还没有找到这场赛事</h1>
          <p className="text-sm leading-7 text-stone-400">
            这通常意味着初始化结果还没保存。先回到启动台，创建一届新的唐氏杯赛事。
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
            >
              返回启动台
            </Link>
          </div>
        </GlowCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-16 lg:px-10">
      <GlowCard className="overflow-hidden p-0">
        <div className="relative border-b border-white/8 bg-[linear-gradient(120deg,rgba(255,122,69,0.18),transparent_45%,rgba(77,227,255,0.15))] px-6 py-8 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {setup.season.cupName ? <Pill>{setup.season.cupName}</Pill> : null}
                <Pill>{setup.season.label}</Pill>
                <Pill>{setup.event.teamCount} 队</Pill>
                <Pill>{setup.event.bestOf.toUpperCase()}</Pill>
                <Pill>{toneLabels[setup.event.tone]}</Pill>
                <Pill>{setup.event.formatId}</Pill>
              </div>
              <div>
                <h1 className="font-display text-5xl uppercase tracking-[0.08em] text-stone-50 lg:text-6xl">{setup.event.title}</h1>
                <p className="mt-3 max-w-3xl text-base leading-8 text-stone-300/82">{setup.season.theme}</p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-black/18 px-4 py-3 text-sm text-stone-300">
                赛事控制台已开启。每录入一场结果，流程图会自动推进；修改上游结果时，下游依赖场次也会自动回退，避免状态串线。
              </div>
            </div>

            <div className="grid min-w-[260px] gap-3">
              <div className="rounded-[24px] border border-white/10 bg-black/26 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">当前冠军位</p>
                <p className="mt-3 text-2xl font-semibold text-stone-50">{champion?.name ?? "等待决出"}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/26 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">自动保存</p>
                <p className="mt-3 text-sm leading-7 text-stone-300">所有比分操作都会即时写回浏览器本地存储，刷新页面不会丢。</p>
                {champion ? (
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleSyncChronicle}
                      className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/12 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/18"
                    >
                      {existingChronicleEntry ? "重新同步编年史" : "同步到编年史"}
                    </button>
                    <p className="text-xs leading-6 text-stone-400">
                      冠军确认后，再由你手动归档到编年史，避免中途录分时误写历史。
                    </p>
                  </div>
                ) : null}
                {syncMessage ? <p className="mt-3 text-xs leading-6 text-cyan-200">{syncMessage}</p> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
          <div className="space-y-5">
            <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Interactive Flow</p>
                  <h2 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">赛事流程图</h2>
                </div>
                <Pill>可手动推进</Pill>
              </div>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                下面的每张比赛卡都能直接录入比分。三队模式会自动刷新积分榜和总决赛席位，四队模式会自动同步胜败者路线。
              </p>
              <div className="mt-5">
                <TournamentFlowRenderer
                  flow={setup.flow}
                  editable
                  onScoreSelect={handleScoreSelect}
                  onClearMatch={handleClearMatch}
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Lineup Rail</p>
              <h2 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">参赛队伍</h2>
              <div className="mt-5 space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="rounded-[26px] border border-white/10 bg-white/6 p-4">
                    <div className="flex items-start gap-4">
                      <TeamAvatar src={team.avatarSrc} alt={team.name} accentColor={team.accentColor} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-display text-2xl uppercase tracking-[0.08em] text-stone-50">{team.name}</h3>
                          <Pill>Seed {team.seed}</Pill>
                          <Pill>平衡分 {team.totalPower}</Pill>
                        </div>
                        {team.slogan ? <p className="mt-2 text-sm leading-6 text-stone-400">{team.slogan}</p> : null}
                        <div className="mt-3 space-y-2">
                          {team.players.map((player) => (
                            <div key={player.id} className="flex items-center justify-between gap-3 text-sm text-stone-300">
                              <span className="truncate">{player.nickname}</span>
                              <div className="flex flex-wrap items-center gap-2">
                                {player.id === team.captainId ? <Pill className="text-cyan-200">队长</Pill> : null}
                                <RankChip rank={player.highestRank} className="text-[10px]" />
                              </div>
                            </div>
                          ))}
                        </div>
                        {team.coachId ? (
                          <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/8 px-3 py-3 text-sm text-cyan-200">
                            教练：{players.find((player) => player.id === team.coachId)?.nickname ?? "待定"}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Rules</p>
              <h2 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">本届机制</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedModifiers.length ? (
                  selectedModifiers.map((modifier) => <Pill key={modifier.id}>{modifier.title}</Pill>)
                ) : (
                  <span className="text-sm text-stone-400">本届采用标准规则，无额外整活卡。</span>
                )}
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">参赛人数</p>
                  <p className="mt-2 text-sm font-semibold text-stone-100">{setup.selectedPlayerIds.length} 人</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">队长数量</p>
                  <p className="mt-2 text-sm font-semibold text-stone-100">{setup.captainIds.length} 位</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
