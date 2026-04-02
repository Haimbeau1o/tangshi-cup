import type { MatchSeriesType } from "@/lib/types";

export function resolveFixedBestOf(teamCount: 2 | 3 | 4): MatchSeriesType {
  return teamCount === 2 ? "bo3" : "bo1";
}
