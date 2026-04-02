import type { PublishedSetup } from "@/lib/types";

function parseSeasonSequence(label: string) {
  const match = label.trim().match(/^s\s*(\d+)$/i);

  return match ? Number(match[1]) : null;
}

export function getNextSeasonSequence(publishedSetups: PublishedSetup[]) {
  const sequences = publishedSetups
    .map((setup) => parseSeasonSequence(setup.season.label))
    .filter((value): value is number => value !== null && Number.isFinite(value) && value >= 1);

  if (!sequences.length) {
    return 1;
  }

  return Math.max(...sequences) + 1;
}
