import { getDefaultPlayers, getDefaultRuleModifiers } from "@/lib/content/defaults";
import type { Player, RuleModifier } from "@/lib/types";

const PLAYERS_KEY = "tangshi-cup:players";
const RULE_MODIFIERS_KEY = "tangshi-cup:rule-modifiers";
const CONTENT_STORAGE_EVENT = "tangshi-cup:content-storage-change";

let playersSnapshotCache: {
  raw: string | null;
  value: Player[];
} = {
  raw: null,
  value: getDefaultPlayers(),
};

let ruleModifiersSnapshotCache: {
  raw: string | null;
  value: RuleModifier[];
} = {
  raw: null,
  value: getDefaultRuleModifiers(),
};

function canUseStorage() {
  return typeof window !== "undefined";
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

function readJson<T>(key: string, fallback: T) {
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

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(CONTENT_STORAGE_EVENT));
}

export function subscribeContentStorage(onChange: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const handleChange = () => {
    onChange();
  };

  window.addEventListener(CONTENT_STORAGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(CONTENT_STORAGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function getPlayersSnapshot() {
  const rawValue = readRawValue(PLAYERS_KEY);

  if (rawValue === playersSnapshotCache.raw) {
    return playersSnapshotCache.value;
  }

  playersSnapshotCache = {
    raw: rawValue,
    value: rawValue ? readJson<Player[]>(PLAYERS_KEY, getDefaultPlayers()) : getDefaultPlayers(),
  };

  return playersSnapshotCache.value;
}

export function getRuleModifiersSnapshot() {
  const rawValue = readRawValue(RULE_MODIFIERS_KEY);

  if (rawValue === ruleModifiersSnapshotCache.raw) {
    return ruleModifiersSnapshotCache.value;
  }

  ruleModifiersSnapshotCache = {
    raw: rawValue,
    value: rawValue ? readJson<RuleModifier[]>(RULE_MODIFIERS_KEY, getDefaultRuleModifiers()) : getDefaultRuleModifiers(),
  };

  return ruleModifiersSnapshotCache.value;
}

export function savePlayers(players: Player[]) {
  writeJson(PLAYERS_KEY, players);
}

export function saveRuleModifiers(ruleModifiers: RuleModifier[]) {
  writeJson(RULE_MODIFIERS_KEY, ruleModifiers);
}

export function upsertPlayer(player: Player) {
  const nextPlayers = [...getPlayersSnapshot().filter((item) => item.id !== player.id), player];
  savePlayers(nextPlayers);
  return player;
}

export function deletePlayer(playerId: string) {
  savePlayers(getPlayersSnapshot().filter((player) => player.id !== playerId));
}

export function importPlayers(players: Player[]) {
  savePlayers(players);
}

export function upsertRuleModifier(ruleModifier: RuleModifier) {
  const nextRuleModifiers = [...getRuleModifiersSnapshot().filter((item) => item.id !== ruleModifier.id), ruleModifier];
  saveRuleModifiers(nextRuleModifiers);
  return ruleModifier;
}

export function deleteRuleModifier(ruleModifierId: string) {
  saveRuleModifiers(getRuleModifiersSnapshot().filter((modifier) => modifier.id !== ruleModifierId));
}
