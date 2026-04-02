import { buildSeasonDefaults } from "@/lib/seasons/build-season-defaults";
import type { SeasonSetupDraft } from "@/lib/types";

type SyncGeneratedDraftIdentityPatch = Partial<Pick<SeasonSetupDraft, "season" | "event" | "templateId">>;

export function syncGeneratedDraftIdentity(
  draft: SeasonSetupDraft,
  patch: SyncGeneratedDraftIdentityPatch,
): SeasonSetupDraft {
  const mergedDraft: SeasonSetupDraft = {
    ...draft,
    ...patch,
    season: {
      ...draft.season,
      ...patch.season,
    },
    event: {
      ...draft.event,
      ...patch.event,
    },
  };

  const previousDefaults = buildSeasonDefaults({
    templateId: draft.templateId,
    seasonLabel: draft.season.label,
    cupName: draft.season.cupName,
    seasonSlugFallback: draft.season.slug,
  });
  const nextDefaults = buildSeasonDefaults({
    templateId: mergedDraft.templateId,
    seasonLabel: mergedDraft.season.label,
    cupName: mergedDraft.season.cupName,
    seasonSlugFallback: mergedDraft.season.slug,
  });

  return {
    ...mergedDraft,
    season: {
      ...mergedDraft.season,
      slug: draft.season.slug === previousDefaults.season.slug ? nextDefaults.season.slug : mergedDraft.season.slug,
    },
    event: {
      ...mergedDraft.event,
      slug: draft.event.slug === previousDefaults.event.slug ? nextDefaults.event.slug : mergedDraft.event.slug,
      title: draft.event.title === previousDefaults.event.title ? nextDefaults.event.title : mergedDraft.event.title,
    },
  };
}
