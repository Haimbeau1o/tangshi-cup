import { createSetupDraft } from "@/lib/setup/create-setup-draft";
import type { Player, PublishedSetup, SeasonSetupDraft, SetupTemplateId } from "@/lib/types";

type ResolveInitialSetupDraftInput = {
  requestedTemplateId: string | null;
  shouldResume: boolean;
  storedDraft: SeasonSetupDraft | null;
  players: Player[];
  publishedSetups?: PublishedSetup[];
};

const validTemplateIds: SetupTemplateId[] = ["two-team-standard", "tri-finals", "four-team-carnival"];

function isSetupTemplateId(value: string | null): value is SetupTemplateId {
  return value !== null && validTemplateIds.includes(value as SetupTemplateId);
}

export function resolveInitialSetupDraft({
  requestedTemplateId,
  shouldResume,
  storedDraft,
  players,
  publishedSetups = [],
}: ResolveInitialSetupDraftInput) {
  if (shouldResume && storedDraft) {
    return storedDraft;
  }

  return createSetupDraft({
    templateId: isSetupTemplateId(requestedTemplateId) ? requestedTemplateId : "tri-finals",
    players,
    publishedSetups,
  });
}
