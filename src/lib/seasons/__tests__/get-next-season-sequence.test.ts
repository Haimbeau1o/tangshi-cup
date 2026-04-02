import { describe, expect, it } from "vitest";

import { getNextSeasonSequence } from "@/lib/seasons/get-next-season-sequence";
import type { PublishedSetup } from "@/lib/types";

function makePublishedSetup(label: string, slug: string): PublishedSetup {
  return {
    id: `setup-${slug}`,
    templateId: "tri-finals",
    currentStep: 6,
    season: {
      slug,
      label,
      cupName: "唐氏杯",
      name: "三强试炼",
      theme: "主题",
      tagline: "口号",
    },
    event: {
      slug: `${slug}-tri-finals`,
      title: `唐氏杯 ${label} 三强试炼`,
      teamCount: 3,
      teamSize: 5,
      bestOf: "bo1",
      tone: "balanced",
      timeBudgetMinutes: 120,
      formatId: "tri-finals",
    },
    selectedPlayerIds: [],
    captainIds: [],
    coachIds: [],
    ruleModifierIds: [],
    teamCustomizations: {},
    updatedAt: "2026-04-02T10:00:00.000Z",
    publishedAt: "2026-04-02T10:00:00.000Z",
  };
}

describe("getNextSeasonSequence", () => {
  it("defaults to S1 when there are no published seasons", () => {
    expect(getNextSeasonSequence([])).toBe(1);
  });

  it("advances to the next season when S2 already exists", () => {
    expect(getNextSeasonSequence([makePublishedSetup("S2", "s2")])).toBe(3);
  });

  it("uses the highest saved season plus one", () => {
    expect(
      getNextSeasonSequence([
        makePublishedSetup("S2", "s2"),
        makePublishedSetup("S3", "s3"),
      ]),
    ).toBe(4);
  });
});
