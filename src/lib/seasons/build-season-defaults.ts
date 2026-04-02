import { resolveFixedBestOf } from "@/lib/tournament/resolve-fixed-best-of";
import type { EventSetup, EventTone, SeasonIdentity, SetupTemplateId } from "@/lib/types";

export type SeasonTemplateBlueprint = {
  seasonName: string;
  theme: string;
  tagline: string;
  eventName: string;
  eventSlugSuffix: string;
  teamCount: 2 | 3 | 4;
  tone: EventTone;
  timeBudgetMinutes: number;
  formatId: string;
  ruleModifierIds: string[];
};

export const seasonTemplateBlueprints: Record<SetupTemplateId, SeasonTemplateBlueprint> = {
  "two-team-standard": {
    seasonName: "标准夜赛",
    theme: "回到最纯粹的 5v5 对抗与 BO3 仪式感。",
    tagline: "五打五，三张图，干净地决出今晚的王。",
    eventName: "标准夜赛",
    eventSlugSuffix: "standard-night",
    teamCount: 2,
    tone: "serious",
    timeBudgetMinutes: 100,
    formatId: "standard-bo3",
    ruleModifierIds: [],
  },
  "tri-finals": {
    seasonName: "三强试炼",
    theme: "三队先打循环积分，再由前二晋级总决赛。",
    tagline: "先看稳定性，再看决赛爆发力。",
    eventName: "三强试炼",
    eventSlugSuffix: "tri-finals",
    teamCount: 3,
    tone: "balanced",
    timeBudgetMinutes: 120,
    formatId: "tri-finals",
    ruleModifierIds: ["coach-call", "clutch-bounty"],
  },
  "four-team-carnival": {
    seasonName: "嘉年华夜",
    theme: "四队进场，主打赛事感和观赏感并存。",
    tagline: "四队进场，流程拉满，节目效果也拉满。",
    eventName: "嘉年华夜",
    eventSlugSuffix: "carnival-night",
    teamCount: 4,
    tone: "fun",
    timeBudgetMinutes: 180,
    formatId: "carnival-night",
    ruleModifierIds: ["warmup-ladder", "shotgun-tax", "coach-call"],
  },
};

function toSafeSlug(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return slug.length ? slug : fallback;
}

export function deriveSeasonSlug(label: string, fallback = "s1") {
  const normalized = label.trim().toLowerCase();
  const directSeasonMatch = normalized.match(/^s\s*(\d+)$/i);

  if (directSeasonMatch) {
    return `s${Number(directSeasonMatch[1])}`;
  }

  return toSafeSlug(label, fallback);
}

type BuildSeasonDefaultsInput = {
  templateId: SetupTemplateId;
  seasonLabel: string;
  cupName?: string;
  seasonSlugFallback?: string;
};

export function buildSeasonDefaults({
  templateId,
  seasonLabel,
  cupName = "唐氏杯",
  seasonSlugFallback = "s1",
}: BuildSeasonDefaultsInput): {
  season: SeasonIdentity;
  event: EventSetup;
} {
  const blueprint = seasonTemplateBlueprints[templateId];
  const seasonSlug = deriveSeasonSlug(seasonLabel, seasonSlugFallback);

  return {
    season: {
      slug: seasonSlug,
      label: seasonLabel,
      cupName,
      name: blueprint.seasonName,
      theme: blueprint.theme,
      tagline: blueprint.tagline,
    },
    event: {
      slug: `${seasonSlug}-${blueprint.eventSlugSuffix}`,
      title: `${cupName} ${seasonLabel} ${blueprint.eventName}`,
      teamCount: blueprint.teamCount,
      teamSize: 5,
      bestOf: resolveFixedBestOf(blueprint.teamCount),
      tone: blueprint.tone,
      timeBudgetMinutes: blueprint.timeBudgetMinutes,
      formatId: blueprint.formatId,
    },
  };
}
