import type {
  PublishedSetup,
  SeasonSetupDraft,
  Team,
  TeamCustomization,
  TournamentFlow,
  TournamentMatch,
} from "@/lib/types";

const DRAFT_KEY = "tangshi-cup:season-setup-draft";
const PUBLISHED_KEY = "tangshi-cup:published-setups";
const STORAGE_EVENT = "tangshi-cup:storage-change";
const EMPTY_PUBLISHED_SETUPS: PublishedSetup[] = [];

let draftSnapshotCache: {
  raw: string | null;
  value: SeasonSetupDraft | null;
} = {
  raw: null,
  value: null,
};

let publishedSetupsSnapshotCache: {
  raw: string | null;
  value: PublishedSetup[];
} = {
  raw: null,
  value: EMPTY_PUBLISHED_SETUPS,
};

function normalizeTeam(team: Team): Team {
  return {
    ...team,
    slogan: team.slogan,
  };
}

function sanitizeTeamCustomization(customization: TeamCustomization): TeamCustomization {
  if (!customization.avatarAssetId) {
    return customization;
  }

  return {
    ...customization,
    avatarSrc: undefined,
  };
}

function sanitizeTeamForPersistence(team: Team): Team {
  if (!team.avatarAssetId) {
    return team;
  }

  return {
    ...team,
    avatarSrc: undefined,
  };
}

function normalizeMatch(match: TournamentMatch): TournamentMatch {
  const score = match.score ?? match.result?.score ?? { left: 0, right: 0 };
  const normalizedStatus =
    match.status ??
    (match.result ? "completed" : score.left > 0 || score.right > 0 ? "live" : "pending");

  return {
    ...match,
    score,
    status: normalizedStatus,
  };
}

function normalizeFlow(flow: TournamentFlow, fallbackTeams: Team[] = []): TournamentFlow {
  const teams = Array.isArray(flow.teams) && flow.teams.length ? flow.teams : fallbackTeams;
  const phases = Array.isArray(flow.phases) ? flow.phases : [];

  return {
    ...flow,
    teams: teams.map(normalizeTeam),
    phases: phases.map((phase) => ({
      ...phase,
      matches: Array.isArray(phase.matches) ? phase.matches.map(normalizeMatch) : [],
    })),
  };
}

function sanitizeFlowForPersistence(flow: TournamentFlow, fallbackTeams: Team[] = []): TournamentFlow {
  const normalizedFlow = normalizeFlow(flow, fallbackTeams);
  const sanitizedTeams = normalizedFlow.teams.map(sanitizeTeamForPersistence);
  const assetBackedTeamIds = new Set(
    sanitizedTeams.filter((team) => team.avatarAssetId).map((team) => team.id),
  );

  return {
    ...normalizedFlow,
    teams: sanitizedTeams,
    phases: normalizedFlow.phases.map((phase) => ({
      ...phase,
      standings: phase.standings?.map((entry) => ({
        ...entry,
        avatarSrc: assetBackedTeamIds.has(entry.teamId) ? undefined : entry.avatarSrc,
      })),
      matches: phase.matches.map((match) => ({
        ...match,
        slots: match.slots.map((slot) => ({
          ...slot,
          avatarSrc:
            slot.teamId && assetBackedTeamIds.has(slot.teamId)
              ? undefined
              : slot.avatarSrc,
        })) as typeof match.slots,
      })),
    })),
  };
}

function normalizeSetupDraft<T extends SeasonSetupDraft | PublishedSetup>(draft: T): T {
  const generatedTeams = draft.generatedTeams?.map(normalizeTeam);

  return {
    ...draft,
    season: {
      cupName: "唐氏杯",
      ...draft.season,
    },
    teamCustomizations: draft.teamCustomizations ?? {},
    generatedTeams,
    flow: draft.flow ? normalizeFlow(draft.flow, generatedTeams ?? []) : draft.flow,
  };
}

function sanitizeSetupForPersistence<T extends SeasonSetupDraft | PublishedSetup>(draft: T): T {
  const normalizedDraft = normalizeSetupDraft(draft);
  const generatedTeams = normalizedDraft.generatedTeams?.map(sanitizeTeamForPersistence);

  return {
    ...normalizedDraft,
    teamCustomizations: Object.fromEntries(
      Object.entries(normalizedDraft.teamCustomizations ?? {}).map(([teamId, customization]) => [
        teamId,
        sanitizeTeamCustomization(customization),
      ]),
    ),
    generatedTeams,
    flow: normalizedDraft.flow
      ? sanitizeFlowForPersistence(normalizedDraft.flow, generatedTeams ?? [])
      : normalizedDraft.flow,
  };
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readRawValue(key: string) {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function loadSetupDraft() {
  return getSetupDraftSnapshot();
}

export function saveSetupDraft(draft: SeasonSetupDraft) {
  writeJson(DRAFT_KEY, sanitizeSetupForPersistence(draft));
}

export function clearSetupDraft() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(DRAFT_KEY);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function listPublishedSetups() {
  return getPublishedSetupsSnapshot();
}

export function savePublishedSetup(draft: SeasonSetupDraft) {
  const nextItem = upsertPublishedSetup(draft);

  return nextItem;
}

export function upsertPublishedSetup(setup: SeasonSetupDraft | PublishedSetup) {
  const publishedSetups = listPublishedSetups();
  const existingSetup = publishedSetups.find((item) => item.event.slug === setup.event.slug);
  const nextItem: PublishedSetup = sanitizeSetupForPersistence({
    ...setup,
    publishedAt:
      "publishedAt" in setup
        ? setup.publishedAt
        : existingSetup?.publishedAt ?? new Date().toISOString(),
  });
  const remainingItems = publishedSetups.filter((item) => item.event.slug !== setup.event.slug);

  writeJson(PUBLISHED_KEY, [nextItem, ...remainingItems]);

  return nextItem;
}

export function getPublishedSetupBySlug(slug: string) {
  return listPublishedSetups().find((item) => item.event.slug === slug) ?? null;
}

export function getSetupDraftSnapshot() {
  const rawValue = readRawValue(DRAFT_KEY);

  if (rawValue === draftSnapshotCache.raw) {
    return draftSnapshotCache.value;
  }

  draftSnapshotCache = {
    raw: rawValue,
    value: rawValue
      ? (() => {
          const parsedDraft = readJson<SeasonSetupDraft | null>(DRAFT_KEY, null);
          return parsedDraft ? normalizeSetupDraft(parsedDraft) : null;
        })()
      : null,
  };

  return draftSnapshotCache.value;
}

export function getPublishedSetupsSnapshot() {
  const rawValue = readRawValue(PUBLISHED_KEY);

  if (rawValue === publishedSetupsSnapshotCache.raw) {
    return publishedSetupsSnapshotCache.value;
  }

  publishedSetupsSnapshotCache = {
    raw: rawValue,
    value: rawValue
      ? readJson<PublishedSetup[]>(PUBLISHED_KEY, EMPTY_PUBLISHED_SETUPS).map((setup) => normalizeSetupDraft(setup))
      : EMPTY_PUBLISHED_SETUPS,
  };

  return publishedSetupsSnapshotCache.value;
}

export function subscribeSetupStorage(onChange: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const handleChange = () => {
    onChange();
  };

  window.addEventListener(STORAGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(STORAGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}
