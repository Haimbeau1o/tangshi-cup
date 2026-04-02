import type { ChronicleEntry } from "@/lib/types";

const CHRONICLE_KEY = "tangshi-cup:chronicle-entries";
const STORAGE_EVENT = "tangshi-cup:chronicle-storage-change";
const EMPTY_ENTRIES: ChronicleEntry[] = [];

let chronicleSnapshotCache: {
  raw: string | null;
  value: ChronicleEntry[];
} = {
  raw: null,
  value: EMPTY_ENTRIES,
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readRawValue() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(CHRONICLE_KEY);
  } catch {
    return null;
  }
}

function sortEntries(entries: ChronicleEntry[]) {
  return [...entries].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function normalizeEntry(entry: ChronicleEntry): ChronicleEntry {
  return {
    ...entry,
    eventTitle: entry.eventTitle,
    championTeamId: entry.championTeamId,
    championName: entry.championName,
    mvpPlayerId: entry.mvpPlayerId,
    mvpName: entry.mvpName,
    svpPlayerId: entry.svpPlayerId,
    svpName: entry.svpName,
    votingNote: entry.votingNote,
  };
}

function readEntries() {
  const rawValue = readRawValue();

  if (!rawValue) {
    return EMPTY_ENTRIES;
  }

  try {
    return sortEntries((JSON.parse(rawValue) as ChronicleEntry[]).map(normalizeEntry));
  } catch {
    return EMPTY_ENTRIES;
  }
}

function writeEntries(entries: ChronicleEntry[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CHRONICLE_KEY, JSON.stringify(sortEntries(entries)));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function getChronicleEntriesSnapshot() {
  const rawValue = readRawValue();

  if (rawValue === chronicleSnapshotCache.raw) {
    return chronicleSnapshotCache.value;
  }

  chronicleSnapshotCache = {
    raw: rawValue,
    value: rawValue ? readEntries() : EMPTY_ENTRIES,
  };

  return chronicleSnapshotCache.value;
}

export function upsertChronicleEntry(entry: ChronicleEntry) {
  const entries = getChronicleEntriesSnapshot();
  const remainingEntries = entries.filter((item) => item.eventSlug !== entry.eventSlug);
  const nextEntries = [normalizeEntry(entry), ...remainingEntries];

  writeEntries(nextEntries);

  return normalizeEntry(entry);
}

export function deleteChronicleEntry(eventSlug: string) {
  const remainingEntries = getChronicleEntriesSnapshot().filter((entry) => entry.eventSlug !== eventSlug);

  writeEntries(remainingEntries);

  return remainingEntries;
}

export function subscribeChronicleStorage(onChange: () => void) {
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
