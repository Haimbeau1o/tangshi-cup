import { generateBalancedTeams } from "@/lib/balance/generate-balanced-teams";
import { mockPlayers } from "@/lib/data/mock-players";
import { formatPresets } from "@/lib/formats/format-presets";
import { recommendFormat } from "@/lib/formats/recommend-format";
import { calculatePlayerPower } from "@/lib/player-rating";
import type { EventCard, RuleModifier, SeasonStory, SeasonSummary } from "@/lib/types";

export const seasons: SeasonSummary[] = [
  {
    id: "season-1",
    slug: "s1",
    name: "霓虹开季",
    label: "S1",
    theme: "从朋友局升级成真正的民间邀请赛。",
    champion: "等待首冠",
    mvp: "等待第一位 MVP",
    record: "1 场样例赛事已就绪",
    story: "唐氏杯的第一季将建立队伍档案、赛制传统和首批经典桥段。",
  },
  {
    id: "season-2",
    slug: "s2",
    name: "王朝试炼",
    label: "S2",
    theme: "让冠军面对真正的复仇线和宿敌挑战。",
    champion: "待开启",
    mvp: "待开启",
    record: "计划中的赛季蓝图",
    story: "S2 预留给更完整的数据追踪、历史对比和赛季荣誉墙。",
  },
];

export const events: EventCard[] = [
  {
    slug: "opening-night",
    title: "唐氏杯 S1 开幕夜",
    seasonSlug: "s1",
    tone: "balanced",
    teamCount: 3,
    timeBudgetMinutes: 90,
    formatId: "triple-round-robin",
    headline: "三强循环 + 战力平衡 + 趣味规则卡的完整首秀。",
  },
  {
    slug: "grand-final-showdown",
    title: "唐氏杯 决赛夜 Showdown",
    seasonSlug: "s1",
    tone: "serious",
    teamCount: 2,
    timeBudgetMinutes: 130,
    formatId: "standard-bo3",
    headline: "最像正式赛事的一晚，强调地图 veto 和冠军仪式感。",
  },
  {
    slug: "carnival-night",
    title: "唐氏杯 嘉年华夜",
    seasonSlug: "s2",
    tone: "fun",
    teamCount: 4,
    timeBudgetMinutes: 180,
    formatId: "carnival-night",
    headline: "四队混战编排 + 娱乐 challenge + 全明星表演赛。",
  },
];

export const ruleModifiers: RuleModifier[] = [
  {
    id: "sheriff-half",
    title: "Sheriff Only 半场",
    category: "weapon",
    impact: "side-awards",
    description: "上半场每队必须有两回合全员 Sheriff，额外记录精准击杀王。",
  },
  {
    id: "coach-call",
    title: "Coach Call Round",
    category: "story",
    impact: "atmosphere",
    description: "每队有一次战术暂停，可抽一张强制战术卡并立即执行。",
  },
  {
    id: "clutch-bounty",
    title: "Clutch Bounty",
    category: "story",
    impact: "side-awards",
    description: "1vX 成功会额外累计个人 bounty 积分，不直接影响总排名。",
  },
  {
    id: "shotgun-tax",
    title: "喷子税回合",
    category: "weapon",
    impact: "atmosphere",
    description: "每隔三回合抽签决定一队需要强制近距离武器开局。",
  },
  {
    id: "warmup-ladder",
    title: "Skirmish 热身梯",
    category: "warmup",
    impact: "atmosphere",
    description: "正赛前进行 1v1 小图 ladder，决定镜头顺序和开幕站位。",
  },
];

export const seasonStories: SeasonStory[] = [
  {
    id: "story-1",
    seasonSlug: "s1",
    title: "规则立宪夜",
    dateLabel: "S1 / Week 0",
    summary: "唐氏杯决定不再靠口头约定，而是用网站固定赛制、选人和平衡机制。",
    tag: "Founding",
  },
  {
    id: "story-2",
    seasonSlug: "s1",
    title: "首套三队循环样例完成",
    dateLabel: "S1 / Week 1",
    summary: "网站首次能根据参赛人数和时长自动给出三队赛程建议与积分逻辑。",
    tag: "Systems",
  },
  {
    id: "story-3",
    seasonSlug: "s2",
    title: "编年史模式上线",
    dateLabel: "S2 / Blueprint",
    summary: "从单场对局扩展到赛季、荣誉和宿敌线，真正形成长期记忆。",
    tag: "Legacy",
  },
];

export const topPlayers = [...mockPlayers]
  .sort((left, right) => calculatePlayerPower(right) - calculatePlayerPower(left))
  .slice(0, 6);

export const featuredEvent = events[0];
export const featuredEventPool = mockPlayers.slice(0, featuredEvent.teamCount * 5);
export const featuredRecommendation = recommendFormat({
  teamCount: featuredEvent.teamCount,
  timeBudgetMinutes: featuredEvent.timeBudgetMinutes,
  tone: featuredEvent.tone,
});
export const featuredBalance = generateBalancedTeams({
  players: featuredEventPool,
  teamCount: featuredEvent.teamCount,
  teamSize: 5,
});

export function getSeasonBySlug(slug: string) {
  return seasons.find((season) => season.slug === slug);
}

export function getStoriesForSeason(slug: string) {
  return seasonStories.filter((story) => story.seasonSlug === slug);
}

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function getPlayerBySlug(slug: string) {
  return mockPlayers.find((player) => player.slug === slug);
}

export function getEventBuild(slug: string) {
  const event = getEventBySlug(slug);

  if (!event) {
    return null;
  }

  const playerPool = mockPlayers.slice(0, event.teamCount * 5);

  return {
    event,
    playerPool,
    recommendation: recommendFormat({
      teamCount: event.teamCount,
      timeBudgetMinutes: event.timeBudgetMinutes,
      tone: event.tone,
    }),
    balance: generateBalancedTeams({
      players: playerPool,
      teamCount: event.teamCount,
      teamSize: 5,
    }),
  };
}

export const formatLibrary = [2, 3, 4].map((teamCount) => ({
  teamCount,
  presets: formatPresets.filter((preset) => preset.teamCount === teamCount),
}));
