import { describe, expect, it } from "vitest";

import { recommendFormat } from "@/lib/formats/recommend-format";

describe("recommendFormat", () => {
  it("recommends a standard BO3 for a serious two-team night", () => {
    const result = recommendFormat({
      teamCount: 2,
      timeBudgetMinutes: 90,
      tone: "serious",
    });

    expect(result.recommended.id).toBe("standard-bo3");
  });

  it("prefers a points sprint for a short three-team party night", () => {
    const result = recommendFormat({
      teamCount: 3,
      timeBudgetMinutes: 60,
      tone: "fun",
    });

    expect(result.recommended.id).toBe("points-sprint");
  });

  it("leans into a carnival format for a long four-team celebration", () => {
    const result = recommendFormat({
      teamCount: 4,
      timeBudgetMinutes: 180,
      tone: "fun",
    });

    expect(result.recommended.id).toBe("carnival-night");
    expect(result.alternates.length).toBeGreaterThan(0);
  });
});
