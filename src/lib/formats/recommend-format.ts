import type { FormatRecommendation, FormatRecommendationInput, TournamentFormatPreset } from "@/lib/types";

import { formatPresets } from "@/lib/formats/format-presets";

function scorePreset(preset: TournamentFormatPreset, input: FormatRecommendationInput) {
  const distanceFromWindow =
    input.timeBudgetMinutes < preset.minMinutes
      ? preset.minMinutes - input.timeBudgetMinutes
      : input.timeBudgetMinutes > preset.maxMinutes
        ? input.timeBudgetMinutes - preset.maxMinutes
        : 0;

  const timeScore = Math.max(0, 10 - distanceFromWindow / 10);
  const toneScore = preset.seriousnessFit[input.tone];
  const flavorScore =
    input.tone === "serious"
      ? preset.fairness
      : input.tone === "fun"
        ? preset.fun
        : (preset.fairness + preset.fun) / 2;

  return timeScore * 0.5 + toneScore * 0.3 + flavorScore * 0.2;
}

export function recommendFormat(input: FormatRecommendationInput): FormatRecommendation {
  const scoredPresets = formatPresets
    .filter((preset) => preset.teamCount === input.teamCount)
    .map((preset) => ({
      preset,
      score: scorePreset(preset, input),
    }))
    .sort((left, right) => right.score - left.score);

  return {
    recommended: scoredPresets[0].preset,
    alternates: scoredPresets.slice(1, 3).map((entry) => entry.preset),
  };
}
