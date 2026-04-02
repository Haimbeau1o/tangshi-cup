"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { getAvatarAssetsSnapshot, loadAvatarAssets, saveAvatarAsset, subscribeAssetStorage } from "@/lib/assets/storage";
import { RuleLibraryManager } from "@/components/content/rule-library-manager";
import { TournamentFlowRenderer } from "@/components/flow/tournament-flow-renderer";
import { getPlayersSnapshot, getRuleModifiersSnapshot, subscribeContentStorage } from "@/lib/content/storage";
import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { RankChip } from "@/components/ui/rank-chip";
import { TeamAvatar } from "@/components/ui/team-avatar";
import { buildDraftPreview, canGeneratePreview, getRequiredPlayerCount } from "@/lib/setup/build-draft-preview";
import { resolveInitialSetupDraft } from "@/lib/setup/resolve-initial-setup-draft";
import { sanitizeSetupDraftReferences } from "@/lib/setup/sanitize-setup-draft-references";
import { resolveFixedBestOf } from "@/lib/tournament/resolve-fixed-best-of";
import {
  clearSetupDraft,
  getSetupDraftSnapshot,
  savePublishedSetup,
  saveSetupDraft,
  subscribeSetupStorage,
} from "@/lib/setup/storage";
import type { SeasonSetupDraft, SetupTemplateId } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";

const steps = ["赛季信息", "赛事结构", "选手池", "队长与教练", "规则卡", "预览并保存"] as const;

const toneLabels = {
  serious: "认真",
  balanced: "平衡",
  fun: "整活",
} as const;

type SeasonSetupWizardProps = {
  initialTemplateId: SetupTemplateId;
  shouldResume: boolean;
};

function toSafeSlug(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return slug.length ? slug : fallback;
}

function getDefaultFormatId(teamCount: 2 | 3 | 4, tone: SeasonSetupDraft["event"]["tone"]) {
  if (teamCount === 2) {
    return "standard-bo3";
  }

  if (teamCount === 3) {
    return "tri-finals";
  }

  return tone === "fun" ? "carnival-night" : "dual-bracket-finals";
}

function getRecommendedPlayerIds(templateId: SetupTemplateId, currentPlayerIds: string[]) {
  const count = templateId === "two-team-standard" ? 10 : templateId === "tri-finals" ? 15 : 20;

  return currentPlayerIds.slice(0, count);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function SeasonSetupWizard({ initialTemplateId, shouldResume }: SeasonSetupWizardProps) {
  const router = useRouter();
  const isHydrated = useHydrated();
  const players = useSyncExternalStore(subscribeContentStorage, getPlayersSnapshot, getPlayersSnapshot);
  const ruleModifiers = useSyncExternalStore(
    subscribeContentStorage,
    getRuleModifiersSnapshot,
    getRuleModifiersSnapshot,
  );
  const avatarAssets = useSyncExternalStore(subscribeAssetStorage, getAvatarAssetsSnapshot, getAvatarAssetsSnapshot);
  const storedDraft = useSyncExternalStore(subscribeSetupStorage, getSetupDraftSnapshot, getSetupDraftSnapshot);
  const baseDraft = useMemo(
    () =>
      resolveInitialSetupDraft({
        requestedTemplateId: initialTemplateId,
        shouldResume,
        storedDraft,
        players,
      }),
    [initialTemplateId, players, shouldResume, storedDraft],
  );
  const [draftEdits, setDraftEdits] = useState<SeasonSetupDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const draft = useMemo(
    () => {
      const sanitizedDraft = sanitizeSetupDraftReferences(draftEdits ?? baseDraft, players, ruleModifiers);
      const fixedBestOf = resolveFixedBestOf(sanitizedDraft.event.teamCount);

      if (sanitizedDraft.event.bestOf === fixedBestOf) {
        return sanitizedDraft;
      }

      return {
        ...sanitizedDraft,
        event: {
          ...sanitizedDraft.event,
          bestOf: fixedBestOf,
        },
      };
    },
    [baseDraft, draftEdits, players, ruleModifiers],
  );

  useEffect(() => {
    saveSetupDraft(draft);
  }, [draft]);

  useEffect(() => {
    void loadAvatarAssets().catch(() => {
      setErrorMessage("本地队徽资源读取失败，已回退到默认队徽。");
    });
  }, []);

  const preview = useMemo(
    () => buildDraftPreview(draft, players, ruleModifiers, avatarAssets),
    [avatarAssets, draft, players, ruleModifiers],
  );
  const requiredPlayerCount = getRequiredPlayerCount(draft);
  const currentStepIndex = draft.currentStep - 1;
  const coachCandidates = useMemo(() => players.filter((player) => player.canCoach), [players]);

  function getEditableDraft(current: SeasonSetupDraft | null) {
    return sanitizeSetupDraftReferences(current ?? draft, players, ruleModifiers);
  }

  function getCoachName(coachId?: string) {
    return players.find((player) => player.id === coachId)?.nickname ?? "待定";
  }

  function patchDraft(patch: Partial<SeasonSetupDraft>) {
    setDraftEdits((current) => ({
      ...getEditableDraft(current),
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }

  function patchSeasonField<K extends keyof SeasonSetupDraft["season"]>(key: K, value: SeasonSetupDraft["season"][K]) {
    setDraftEdits((current) => {
      const nextDraft = getEditableDraft(current);

      return {
        ...nextDraft,
        season: {
          ...nextDraft.season,
          [key]: value,
          slug: key === "label" || key === "name" ? toSafeSlug(String(value), nextDraft.season.slug) : nextDraft.season.slug,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function patchEventField<K extends keyof SeasonSetupDraft["event"]>(key: K, value: SeasonSetupDraft["event"][K]) {
    setDraftEdits((current) => {
      const nextDraft = getEditableDraft(current);

      return {
        ...nextDraft,
        event: {
          ...nextDraft.event,
          [key]: value,
          slug: key === "title" ? toSafeSlug(String(value), nextDraft.event.slug) : nextDraft.event.slug,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function handleTemplateScale(teamCount: 2 | 3 | 4) {
    setDraftEdits((current) => {
      const nextDraft = getEditableDraft(current);
      const nextTemplateId =
        teamCount === 2 ? "two-team-standard" : teamCount === 3 ? "tri-finals" : "four-team-carnival";
      const nextTone = teamCount === 4 ? "fun" : teamCount === 2 ? "serious" : "balanced";
      const nextSelected = getRecommendedPlayerIds(nextTemplateId, players.map((player) => player.id));

      return {
        ...nextDraft,
        templateId: nextTemplateId,
        event: {
          ...nextDraft.event,
          teamCount,
          bestOf: resolveFixedBestOf(teamCount),
          tone: nextTone,
          formatId: getDefaultFormatId(teamCount, nextTone),
        },
        selectedPlayerIds: nextSelected,
        captainIds: [],
        coachIds: [],
        ruleModifierIds: nextDraft.ruleModifierIds.filter((id) => ruleModifiers.some((modifier) => modifier.id === id)),
        teamCustomizations: {},
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function togglePlayer(playerId: string) {
    setDraftEdits((current) => {
      const nextDraft = getEditableDraft(current);
      const hasPlayer = nextDraft.selectedPlayerIds.includes(playerId);
      const nextSelected = hasPlayer
        ? nextDraft.selectedPlayerIds.filter((id) => id !== playerId)
        : [...nextDraft.selectedPlayerIds, playerId];

      return {
        ...nextDraft,
        selectedPlayerIds: nextSelected,
        captainIds: nextDraft.captainIds.filter((id) => nextSelected.includes(id)),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function toggleCaptain(playerId: string) {
    setDraftEdits((current) => {
      const nextDraft = getEditableDraft(current);

      if (!nextDraft.selectedPlayerIds.includes(playerId)) {
        return nextDraft;
      }

      const hasCaptain = nextDraft.captainIds.includes(playerId);
      const nextCaptains = hasCaptain
        ? nextDraft.captainIds.filter((id) => id !== playerId)
        : nextDraft.captainIds.length < nextDraft.event.teamCount
          ? [...nextDraft.captainIds, playerId]
          : nextDraft.captainIds;

      return {
        ...nextDraft,
        captainIds: nextCaptains,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function toggleCoach(playerId: string) {
    setDraftEdits((current) => {
      const nextDraft = getEditableDraft(current);
      const hasCoach = nextDraft.coachIds.includes(playerId);
      const nextCoaches = hasCoach
        ? nextDraft.coachIds.filter((id) => id !== playerId)
        : nextDraft.coachIds.length < nextDraft.event.teamCount
          ? [...nextDraft.coachIds, playerId]
          : nextDraft.coachIds;

      return {
        ...nextDraft,
        coachIds: nextCoaches,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function toggleRuleModifier(modifierId: string) {
    setDraftEdits((current) => {
      const nextDraft = getEditableDraft(current);
      const hasModifier = nextDraft.ruleModifierIds.includes(modifierId);

      return {
        ...nextDraft,
        ruleModifierIds: hasModifier
          ? nextDraft.ruleModifierIds.filter((id) => id !== modifierId)
          : [...nextDraft.ruleModifierIds, modifierId],
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function fillRecommendedPlayers() {
    patchDraft({
      selectedPlayerIds: players.slice(0, requiredPlayerCount).map((player) => player.id),
      captainIds: [],
      coachIds: [],
    });
  }

  function patchTeamCustomization(teamId: string, patch: Partial<SeasonSetupDraft["teamCustomizations"][string]>) {
    setDraftEdits((current) => {
      const nextDraft = getEditableDraft(current);

      return {
        ...nextDraft,
        teamCustomizations: {
          ...nextDraft.teamCustomizations,
          [teamId]: {
            ...nextDraft.teamCustomizations[teamId],
            ...patch,
          },
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async function handleTeamAvatarUpload(teamId: string, file?: File | null) {
    if (!file) {
      return;
    }

    try {
      const avatarAssetId = `team-avatar:${draft.id}:${teamId}`;
      const dataUrl = await readFileAsDataUrl(file);

      await saveAvatarAsset({
        id: avatarAssetId,
        dataUrl,
        updatedAt: new Date().toISOString(),
      });

      patchTeamCustomization(teamId, {
        avatarAssetId,
        avatarSrc: undefined,
      });
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `队徽导入失败：${error.message}`
          : "队徽导入失败，请换一张更小的图片后再试。",
      );
    }
  }

  function validateStep(stepNumber: number) {
    if (stepNumber === 3 && draft.selectedPlayerIds.length !== requiredPlayerCount) {
      return `当前需要正好 ${requiredPlayerCount} 位选手，才能生成 ${draft.event.teamCount} 支 5 人队伍。`;
    }

    if (stepNumber === 4 && draft.captainIds.length !== draft.event.teamCount) {
      return `当前需要选出 ${draft.event.teamCount} 位队长。`;
    }

    return null;
  }

  function goToStep(stepNumber: number) {
    const validationResult = validateStep(draft.currentStep);

    if (stepNumber > draft.currentStep && validationResult) {
      setErrorMessage(validationResult);
      return;
    }

    setErrorMessage(null);
    patchDraft({ currentStep: stepNumber });
  }

  function handlePublish() {
    if (!canGeneratePreview(draft) || !preview.teams || !preview.flow) {
      setErrorMessage("还不能保存，请先满足人数和队长条件。");
      return;
    }

    const published = savePublishedSetup({
      ...draft,
      generatedTeams: preview.teams.teams,
      flow: preview.flow,
    });

    clearSetupDraft();
    router.push(`/events/${published.event.slug}`);
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <GlowCard className="text-sm text-stone-400">正在读取本地赛季草稿和内容库...</GlowCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-16 lg:px-10">
      <GlowCard className="grid gap-6 lg:grid-cols-[0.3fr_0.7fr]">
        <div className="space-y-3">
          <Pill>Season Setup</Pill>
          <h1 className="font-display text-5xl uppercase tracking-[0.08em] text-stone-50">初始化新赛季</h1>
          <p className="text-sm leading-7 text-stone-400">从模板开始，逐步把新一届唐氏杯配置出来，最后一键生成赛事总览和流程图。</p>
          <div className="space-y-2 pt-3">
            {steps.map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => goToStep(index + 1)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                  draft.currentStep === index + 1 ? "bg-white/10 text-stone-50" : "bg-black/10 text-stone-400 hover:bg-white/6"
                }`}
              >
                <span className="inline-flex size-7 items-center justify-center rounded-full border border-white/10 text-xs font-semibold">
                  {index + 1}
                </span>
                <span>{step}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {currentStepIndex === 0 ? (
            <GlowCard className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-stone-300">杯赛名称</span>
                  <input
                    value={draft.season.cupName ?? ""}
                    onChange={(event) => patchSeasonField("cupName", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-stone-300">赛季标签</span>
                  <input
                    value={draft.season.label}
                    onChange={(event) => patchSeasonField("label", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-stone-300">赛季名称</span>
                  <input
                    value={draft.season.name}
                    onChange={(event) => patchSeasonField("name", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                  />
                </label>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-300">赛季主题</span>
                <textarea
                  value={draft.season.theme}
                  onChange={(event) => patchSeasonField("theme", event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-300">口号</span>
                <input
                  value={draft.season.tagline}
                  onChange={(event) => patchSeasonField("tagline", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                />
              </label>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-stone-400">
                这里可以直接写 `S2`、`S3`、`夏季赛` 之类的标签，杯赛名则负责定义“唐氏杯 / 支线杯 / 娱乐杯”等赛事身份。
              </div>
            </GlowCard>
          ) : null}

          {currentStepIndex === 1 ? (
            <GlowCard className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-medium text-stone-300">先选规模</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {([
                    { teamCount: 2, label: "2 队标准赛" },
                    { teamCount: 3, label: "3 队循环决赛" },
                    { teamCount: 4, label: "4 队嘉年华" },
                  ] as const).map((option) => (
                    <button
                      key={option.teamCount}
                      type="button"
                      onClick={() => handleTemplateScale(option.teamCount)}
                      className={`rounded-[24px] border px-4 py-4 text-left transition ${
                        draft.event.teamCount === option.teamCount
                          ? "border-cyan-300/40 bg-cyan-400/10 text-stone-50"
                          : "border-white/10 bg-black/20 text-stone-300"
                      }`}
                    >
                      <p className="font-display text-3xl uppercase tracking-[0.08em]">{option.teamCount} Teams</p>
                      <p className="mt-2 text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-stone-300">赛事标题</span>
                  <input
                    value={draft.event.title}
                    onChange={(event) => patchEventField("title", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-stone-300">时长预算（分钟）</span>
                  <input
                    type="number"
                    value={draft.event.timeBudgetMinutes}
                    onChange={(event) => patchEventField("timeBudgetMinutes", Number(event.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-stone-300">固定 BO 规则</p>
                  <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
                    <p className="text-lg font-semibold text-stone-50">{draft.event.bestOf.toUpperCase()}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                      {draft.event.teamCount === 2
                        ? "双队对抗固定采用 BO3，保留系列赛仪式感。"
                        : "超过两队时固定采用 BO1，保证整届流程推进足够快。"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-stone-300">氛围倾向</p>
                  <div className="flex flex-wrap gap-2">
                    {(["serious", "balanced", "fun"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          patchEventField("tone", value);
                          patchEventField("formatId", getDefaultFormatId(draft.event.teamCount, value));
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          draft.event.tone === value ? "bg-cyan-400/15 text-cyan-300" : "bg-white/6 text-stone-300"
                        }`}
                      >
                        {toneLabels[value]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlowCard>
          ) : null}

          {currentStepIndex === 2 ? (
            <GlowCard className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-stone-300">当前需要 {requiredPlayerCount} 位选手</p>
                  <p className="text-sm text-stone-500">现在已选择 {draft.selectedPlayerIds.length} / {requiredPlayerCount}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={fillRecommendedPlayers}
                    className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-stone-100"
                  >
                    按推荐人数填满
                  </button>
                  <button
                    type="button"
                    onClick={() => patchDraft({ selectedPlayerIds: [], captainIds: [], coachIds: [] })}
                    className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-stone-300"
                  >
                    清空选择
                  </button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {players.map((player) => {
                  const selected = draft.selectedPlayerIds.includes(player.id);

                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => togglePlayer(player.id)}
                      className={`rounded-[24px] border p-4 text-left transition ${
                        selected ? "border-cyan-300/40 bg-cyan-400/10" : "border-white/10 bg-black/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-stone-50">{player.nickname}</p>
                          <p className="text-sm text-stone-400">{player.mainRole}</p>
                        </div>
                        <RankChip rank={player.highestRank} className="text-[10px]" />
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">{player.riotId}</p>
                      <p className="mt-3 text-sm leading-6 text-stone-400">{player.bio}</p>
                    </button>
                  );
                })}
              </div>
            </GlowCard>
          ) : null}

          {currentStepIndex === 3 ? (
            <GlowCard className="space-y-5">
              <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-stone-300">选择 {draft.event.teamCount} 位队长</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {preview.selectedPlayers.map((player) => {
                      const active = draft.captainIds.includes(player.id);

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => toggleCaptain(player.id)}
                          className={`rounded-[24px] border px-4 py-4 text-left transition ${
                            active ? "border-[#ff5e3a]/40 bg-[#ff5e3a]/10" : "border-white/10 bg-black/20"
                          }`}
                        >
                          <p className="text-base font-semibold text-stone-50">{player.nickname}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <RankChip rank={player.highestRank} className="text-[10px]" />
                            <Pill className="text-[10px]">{player.mainRole}</Pill>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-stone-300">可选教练</p>
                  <div className="space-y-3">
                    {coachCandidates.map((player) => {
                      const active = draft.coachIds.includes(player.id);

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => toggleCoach(player.id)}
                          className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                            active ? "border-cyan-300/40 bg-cyan-400/10" : "border-white/10 bg-black/20"
                          }`}
                        >
                          <p className="text-base font-semibold text-stone-50">{player.nickname}</p>
                          <p className="mt-1 text-sm text-stone-400">{player.bio}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </GlowCard>
          ) : null}

          {currentStepIndex === 4 ? (
            <div className="space-y-5">
              <GlowCard className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-stone-300">标准规则默认启用，你可以额外叠加趣味卡。</p>
                  <p className="mt-1 text-sm text-stone-500">这里的规则卡现在是可编辑的，本地新增或删除之后，当前初始化流程会立刻同步。</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {ruleModifiers.map((modifier) => {
                    const active = draft.ruleModifierIds.includes(modifier.id);

                    return (
                      <button
                        key={modifier.id}
                        type="button"
                        onClick={() => toggleRuleModifier(modifier.id)}
                        className={`rounded-[24px] border p-4 text-left transition ${
                          active ? "border-cyan-300/40 bg-cyan-400/10" : "border-white/10 bg-black/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-stone-50">{modifier.title}</p>
                          <Pill>{modifier.impact}</Pill>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-stone-400">{modifier.description}</p>
                      </button>
                    );
                  })}
                </div>
              </GlowCard>

              <RuleLibraryManager />
            </div>
          ) : null}

          {currentStepIndex === 5 ? (
            <div className="space-y-5">
              <GlowCard className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Pill>{preview.recommendation.recommended.name}</Pill>
                  <Pill>{draft.event.teamCount} 队</Pill>
                  <Pill>{draft.event.bestOf.toUpperCase()}</Pill>
                  <Pill>{toneLabels[draft.event.tone]}</Pill>
                </div>
                <p className="text-sm leading-7 text-stone-300/82">{preview.recommendation.recommended.summary}</p>
                {!canGeneratePreview(draft) ? (
                  <div className="rounded-[24px] border border-[#ff5e3a]/20 bg-[#ff5e3a]/10 px-5 py-4 text-sm font-medium text-[#ffd7cf]">
                    预览还没准备好：需要正好 {requiredPlayerCount} 位选手，并选出 {draft.event.teamCount} 位队长。
                  </div>
                ) : null}
              </GlowCard>

              {preview.teams && preview.flow ? (
                <>
                  <GlowCard className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Generated Teams</p>
                      <div className="flex flex-wrap gap-2">
                        <Pill>Power Spread {preview.teams.powerSpread}</Pill>
                        <Pill>{preview.teams.qualityBand}</Pill>
                      </div>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-4">
                      {preview.teams.teams.map((team) => (
                        <div key={team.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                          <div className="flex items-start gap-4">
                            <TeamAvatar src={team.avatarSrc} alt={team.name} accentColor={team.accentColor} size="md" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate font-display text-2xl uppercase tracking-[0.08em] text-stone-50">{team.name}</h3>
                                <Pill>Seed {team.seed}</Pill>
                                <Pill>平衡分 {team.totalPower}</Pill>
                              </div>
                              {team.slogan ? <p className="mt-2 text-sm leading-6 text-stone-400">{team.slogan}</p> : null}
                              {team.coachId ? (
                                <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-400/8 px-3 py-3 text-sm text-cyan-200">
                                  教练：{getCoachName(team.coachId)}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-4 space-y-3 rounded-[22px] border border-white/8 bg-black/20 p-3">
                            <label className="space-y-2">
                              <span className="text-xs font-medium text-stone-400">战队名</span>
                              <input
                                value={draft.teamCustomizations[team.id]?.name ?? team.name}
                                onChange={(event) => patchTeamCustomization(team.id, { name: event.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-stone-100 outline-none"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs font-medium text-stone-400">战队宣言</span>
                              <input
                                value={draft.teamCustomizations[team.id]?.slogan ?? team.slogan ?? ""}
                                onChange={(event) => patchTeamCustomization(team.id, { slogan: event.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-stone-100 outline-none"
                              />
                            </label>
                            <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-stone-100">
                              导入队徽
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => void handleTeamAvatarUpload(team.id, event.target.files?.[0] ?? null)}
                              />
                            </label>
                          </div>
                          <div className="mt-4 space-y-3">
                            {team.players.map((player) => (
                              <div key={player.id} className="flex items-center justify-between text-sm text-stone-300">
                                <span>{player.nickname}</span>
                                <div className="flex flex-wrap items-center gap-2">
                                  {player.id === team.captainId ? <Pill className="text-cyan-200">队长</Pill> : null}
                                  <RankChip rank={player.highestRank} className="text-[10px]" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlowCard>

                  <GlowCard className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Tournament Flow</p>
                    <TournamentFlowRenderer flow={preview.flow} />
                  </GlowCard>
                </>
              ) : null}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[24px] border border-[#ff5e3a]/20 bg-[#ff5e3a]/10 px-5 py-4 text-sm font-medium text-[#ffd7cf]">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="text-sm font-semibold text-stone-400">
              返回启动台
            </Link>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => goToStep(Math.max(1, draft.currentStep - 1))}
                disabled={draft.currentStep === 1}
                className="rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-stone-300 disabled:opacity-40"
              >
                上一步
              </button>
              {draft.currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => goToStep(Math.min(steps.length, draft.currentStep + 1))}
                  className="rounded-full bg-[#ff5e3a] px-5 py-3 text-sm font-semibold text-white"
                >
                  下一步
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="rounded-full bg-cyan-400/20 px-5 py-3 text-sm font-semibold text-cyan-300"
                >
                  保存并生成赛事页
                </button>
              )}
            </div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
