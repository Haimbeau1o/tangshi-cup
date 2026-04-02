export type PlayerRole = "duelist" | "initiator" | "controller" | "sentinel" | "flex";
export type EventTone = "serious" | "balanced" | "fun";
export type QualityBand = "green" | "yellow" | "red";
export type MatchSeriesType = "bo1" | "bo3" | "bo5";
export type SetupTemplateId = "two-team-standard" | "tri-finals" | "four-team-carnival";
export type RankTier = "黑铁" | "青铜" | "白银" | "黄金" | "铂金" | "钻石" | "超凡" | "深化" | "赋能";
export type TournamentFlowLayout = "series" | "tri-stage" | "quad-bracket";
export type TournamentPhaseKind = "series" | "round-robin" | "final" | "bracket";
export type TournamentMatchStatus = "pending" | "live" | "completed";

export type Player = {
  id: string;
  slug: string;
  nickname: string;
  riotId: string;
  mainRole: PlayerRole;
  preferredAgents: string[];
  highestRank: RankTier;
  isCaptain?: boolean;
  canCoach?: boolean;
  avatarSrc?: string;
  bio?: string;
};

export type Team = {
  id: string;
  name: string;
  slogan?: string;
  players: Player[];
  totalPower: number;
  averagePower: number;
  coveredRoles: PlayerRole[];
  seed?: number;
  captainId?: string;
  coachId?: string;
  avatarId?: string;
  avatarAssetId?: string;
  avatarSrc?: string;
  accentColor?: string;
};

export type TeamBalanceResult = {
  teams: Team[];
  balanceGapPercent: number;
  powerSpread: number;
  qualityBand: QualityBand;
};

export type TeamAvatar = {
  id: string;
  name: string;
  src: string;
  accentColor: string;
};

export type AvatarAssetRecord = {
  id: string;
  dataUrl: string;
  updatedAt: string;
};

export type TournamentFormatPreset = {
  id: string;
  name: string;
  teamCount: 2 | 3 | 4;
  minMinutes: number;
  maxMinutes: number;
  fairness: number;
  fun: number;
  seriousnessFit: Record<EventTone, number>;
  summary: string;
  matchCount: number;
};

export type FormatRecommendationInput = {
  teamCount: 2 | 3 | 4;
  timeBudgetMinutes: number;
  tone: EventTone;
};

export type FormatRecommendation = {
  recommended: TournamentFormatPreset;
  alternates: TournamentFormatPreset[];
};

export type RuleModifier = {
  id: string;
  title: string;
  category: "weapon" | "ability" | "economy" | "story" | "warmup";
  impact: "standings" | "side-awards" | "atmosphere";
  description: string;
};

export type SeasonStory = {
  id: string;
  seasonSlug: string;
  title: string;
  dateLabel: string;
  summary: string;
  tag: string;
};

export type ChronicleEntry = SeasonStory & {
  eventSlug: string;
  championTeamId?: string;
  championName?: string;
  updatedAt: string;
};

export type SeasonSummary = {
  id: string;
  slug: string;
  name: string;
  label: string;
  theme: string;
  champion: string;
  mvp: string;
  record: string;
  story: string;
};

export type EventCard = {
  slug: string;
  title: string;
  seasonSlug: string;
  tone: EventTone;
  teamCount: 2 | 3 | 4;
  timeBudgetMinutes: number;
  formatId: string;
  headline: string;
};

export type TournamentMatchSlot = {
  teamId?: string;
  label: string;
  avatarSrc?: string;
  sourceMatchId?: string;
  sourceOutcome?: "winner" | "loser";
  standingIndex?: number;
};

export type TournamentMatchScore = {
  left: number;
  right: number;
};

export type TournamentMatchResult = {
  winnerTeamId: string;
  score: TournamentMatchScore;
};

export type TournamentMatch = {
  id: string;
  label: string;
  bestOf: MatchSeriesType;
  status: TournamentMatchStatus;
  kind: TournamentPhaseKind;
  slots: [TournamentMatchSlot, TournamentMatchSlot];
  score: TournamentMatchScore;
  note?: string;
  result?: TournamentMatchResult;
};

export type TournamentStandingsEntry = {
  teamId: string;
  name: string;
  avatarSrc?: string;
  wins: number;
  losses: number;
  mapWins: number;
  mapLosses: number;
  mapDiff: number;
  points: number;
  rank: number;
  advanced: boolean;
  eliminated: boolean;
};

export type TournamentFlowPhase = {
  id: string;
  title: string;
  description: string;
  kind: TournamentPhaseKind;
  matches: TournamentMatch[];
  standings?: TournamentStandingsEntry[];
  advancement?: string[];
  eliminated?: string[];
};

export type TournamentFlow = {
  layout: TournamentFlowLayout;
  teams: Team[];
  phases: TournamentFlowPhase[];
  championTeamId?: string;
};

export type SeasonIdentity = {
  slug: string;
  label: string;
  cupName?: string;
  name: string;
  theme: string;
  tagline: string;
};

export type TeamCustomization = {
  name?: string;
  slogan?: string;
  avatarId?: string;
  avatarAssetId?: string;
  avatarSrc?: string;
  accentColor?: string;
};

export type EventSetup = {
  slug: string;
  title: string;
  teamCount: 2 | 3 | 4;
  teamSize: 5;
  bestOf: MatchSeriesType;
  tone: EventTone;
  timeBudgetMinutes: number;
  formatId: string;
};

export type SeasonSetupDraft = {
  id: string;
  templateId: SetupTemplateId;
  currentStep: number;
  season: SeasonIdentity;
  event: EventSetup;
  selectedPlayerIds: string[];
  captainIds: string[];
  coachIds: string[];
  ruleModifierIds: string[];
  teamCustomizations: Record<string, TeamCustomization>;
  generatedTeams?: Team[];
  flow?: TournamentFlow;
  updatedAt: string;
};

export type PublishedSetup = SeasonSetupDraft & {
  publishedAt: string;
};
