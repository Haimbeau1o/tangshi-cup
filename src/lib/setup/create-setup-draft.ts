import { buildSeasonDefaults, seasonTemplateBlueprints } from "@/lib/seasons/build-season-defaults";
import { getNextSeasonSequence } from "@/lib/seasons/get-next-season-sequence";
import { resolveFixedBestOf } from "@/lib/tournament/resolve-fixed-best-of";
import type { Player, PublishedSetup, SeasonSetupDraft, SetupTemplateId } from "@/lib/types";

type CreateSetupDraftInput = {
  templateId: SetupTemplateId;
  players: Player[];
  publishedSetups?: PublishedSetup[];
};

function getRecommendedSelectionCount(templateId: SetupTemplateId) {
  if (templateId === "two-team-standard") {
    return 10;
  }

  if (templateId === "tri-finals") {
    return 15;
  }

  return 20;
}

export function createSetupDraft({
  templateId,
  players,
  publishedSetups = [],
}: CreateSetupDraftInput): SeasonSetupDraft {
  const blueprint = seasonTemplateBlueprints[templateId];
  const seasonSequence = getNextSeasonSequence(publishedSetups);
  const seasonLabel = `S${seasonSequence}`;
  const defaults = buildSeasonDefaults({
    templateId,
    seasonLabel,
  });
  const selectedPlayerIds = players.slice(0, getRecommendedSelectionCount(templateId)).map((player) => player.id);

  return {
    templateId,
    currentStep: 1,
    season: defaults.season,
    event: {
      ...defaults.event,
      bestOf: resolveFixedBestOf(blueprint.teamCount),
    },
    captainIds: [],
    coachIds: [],
    ruleModifierIds: blueprint.ruleModifierIds,
    teamCustomizations: {},
    id: `${templateId}-${Date.now()}`,
    selectedPlayerIds,
    updatedAt: new Date().toISOString(),
  };
}
