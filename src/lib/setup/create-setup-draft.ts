import { resolveFixedBestOf } from "@/lib/tournament/resolve-fixed-best-of";
import type { Player, SeasonSetupDraft, SetupTemplateId } from "@/lib/types";

type CreateSetupDraftInput = {
  templateId: SetupTemplateId;
  players: Player[];
};

const templateDefaults: Record<
  SetupTemplateId,
  Omit<SeasonSetupDraft, "id" | "updatedAt" | "selectedPlayerIds">
> = {
  "two-team-standard": {
    templateId: "two-team-standard",
    currentStep: 1,
    season: {
      slug: "s2",
      label: "S2",
      cupName: "唐氏杯",
      name: "标准夜赛",
      theme: "回到最纯粹的 5v5 对抗与 BO3 仪式感。",
      tagline: "五打五，三张图，干净地决出今晚的王。",
    },
    event: {
      slug: "s2-standard-night",
      title: "唐氏杯 S2 标准夜赛",
      teamCount: 2,
      teamSize: 5,
      bestOf: resolveFixedBestOf(2),
      tone: "serious",
      timeBudgetMinutes: 100,
      formatId: "standard-bo3",
    },
    captainIds: [],
    coachIds: [],
    ruleModifierIds: [],
    teamCustomizations: {},
  },
  "tri-finals": {
    templateId: "tri-finals",
    currentStep: 1,
    season: {
      slug: "s2",
      label: "S2",
      cupName: "唐氏杯",
      name: "三强试炼",
      theme: "三队先打循环积分，再由前二晋级总决赛。",
      tagline: "先看稳定性，再看决赛爆发力。",
    },
    event: {
      slug: "s2-tri-finals",
      title: "唐氏杯 S2 三强试炼",
      teamCount: 3,
      teamSize: 5,
      bestOf: resolveFixedBestOf(3),
      tone: "balanced",
      timeBudgetMinutes: 120,
      formatId: "tri-finals",
    },
    captainIds: [],
    coachIds: [],
    ruleModifierIds: ["coach-call", "clutch-bounty"],
    teamCustomizations: {},
  },
  "four-team-carnival": {
    templateId: "four-team-carnival",
    currentStep: 1,
    season: {
      slug: "s2",
      label: "S2",
      cupName: "唐氏杯",
      name: "嘉年华夜",
      theme: "四队进场，主打赛事感和观赏感并存。",
      tagline: "四队进场，流程拉满，节目效果也拉满。",
    },
    event: {
      slug: "s2-carnival-night",
      title: "唐氏杯 S2 嘉年华夜",
      teamCount: 4,
      teamSize: 5,
      bestOf: resolveFixedBestOf(4),
      tone: "fun",
      timeBudgetMinutes: 180,
      formatId: "carnival-night",
    },
    captainIds: [],
    coachIds: [],
    ruleModifierIds: ["warmup-ladder", "shotgun-tax", "coach-call"],
    teamCustomizations: {},
  },
};

function getRecommendedSelectionCount(templateId: SetupTemplateId) {
  if (templateId === "two-team-standard") {
    return 10;
  }

  if (templateId === "tri-finals") {
    return 15;
  }

  return 20;
}

export function createSetupDraft({ templateId, players }: CreateSetupDraftInput): SeasonSetupDraft {
  const defaults = templateDefaults[templateId];
  const selectedPlayerIds = players.slice(0, getRecommendedSelectionCount(templateId)).map((player) => player.id);

  return {
    ...defaults,
    id: `${templateId}-${Date.now()}`,
    selectedPlayerIds,
    updatedAt: new Date().toISOString(),
  };
}
