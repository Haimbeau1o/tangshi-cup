import type { Player, RuleModifier, SeasonSetupDraft } from "@/lib/types";

export function sanitizeSetupDraftReferences(
  draft: SeasonSetupDraft,
  players: Player[],
  ruleModifiers: RuleModifier[],
) {
  const validPlayerIds = new Set(players.map((player) => player.id));
  const validRuleIds = new Set(ruleModifiers.map((modifier) => modifier.id));
  const nextSelectedPlayerIds = draft.selectedPlayerIds.filter((id) => validPlayerIds.has(id));
  const selectedPlayerIds = new Set(nextSelectedPlayerIds);
  const nextCaptainIds = draft.captainIds.filter((id) => selectedPlayerIds.has(id));
  const nextCoachIds = draft.coachIds.filter((id) => validPlayerIds.has(id));
  const nextRuleModifierIds = draft.ruleModifierIds.filter((id) => validRuleIds.has(id));

  if (
    nextSelectedPlayerIds.length === draft.selectedPlayerIds.length &&
    nextCaptainIds.length === draft.captainIds.length &&
    nextCoachIds.length === draft.coachIds.length &&
    nextRuleModifierIds.length === draft.ruleModifierIds.length
  ) {
    return draft;
  }

  return {
    ...draft,
    selectedPlayerIds: nextSelectedPlayerIds,
    captainIds: nextCaptainIds,
    coachIds: nextCoachIds,
    ruleModifierIds: nextRuleModifierIds,
  };
}
